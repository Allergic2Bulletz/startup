import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthState } from '../hooks/useAuthState.js';
import { useNotificationContext } from './useNotifications.js';

const useBookmarks = ({ currentAuthState, wsClient }) => {
    const [bookmarks, setBookmarks] = useState([]);
    const { showNotification } = useNotificationContext();

    const fetchBookmarks = async () => {
        try {
            const response = await fetch('/api/bookmarks');
            if (!response.ok) {
                console.error('Failed to fetch bookmarks');
                showNotification('Failed to fetch bookmarks', 'error', true);
                return;
            }
            const data = await response.json();
            setBookmarks(data || []);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
            showNotification('Error fetching bookmarks', 'error', true);
        }
    };

    // Load bookmarks from storage/remote
    useEffect(() => {
        const saved = localStorage.getItem('bookmarks');
        if (saved && currentAuthState !== AuthState.Authenticated) {
            try {
                const parsed = JSON.parse(saved);
                setBookmarks(parsed);
                return;
            } catch (error) {
                console.error('Failed to load bookmarks from localStorage:', error);
                showNotification('Failed to load bookmarks from localStorage', 'error', true);
                return;
            }
        }

        if (currentAuthState === AuthState.Authenticated) {
            fetchBookmarks();
        }

        return () => {
            // Cleanup if needed
        };
    }, [currentAuthState, showNotification]);

    // Stable handler function for WebSocket commands
    const handleSync = useCallback((command) => {
        if(command.target !== 'bookmarks') return;
        if(command.action !== 'sync') return;
        fetchBookmarks();
    }, []);

    // Initialize wsClient handlers
    useEffect(() => {
        if (wsClient.current) {
            wsClient.current.addHandler(handleSync);

            return () => {
                wsClient.current?.removeHandler(handleSync);
                console.log('🧹 Cleaned up bookmark wsClient handlers');
            };
        }
    }, [wsClient, handleSync]);

    // Auto-save to localStorage when bookmarks change
    useEffect(() => {
        if (currentAuthState !== AuthState.Authenticated) {
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        }
    }, [bookmarks, currentAuthState]);

    // Get active (non-deleted) bookmarks, sorted by index
    const activeBookmarks = useMemo(() => 
        bookmarks
            .filter(bookmark => !bookmark.deleted)
            .sort((a, b) => a.index - b.index),
        [bookmarks]
    );

    const addBookmark = useCallback((bookmarkData) => {
        const maxIndex = bookmarks
            .filter(b => !b.deleted)
            .reduce((max, b) => Math.max(max, b.index || 0), -1);
        
        const newBookmark = {
            id: crypto.randomUUID(),
            title: bookmarkData.title,
            timezone: bookmarkData.timezone,
            deleted: false,
            index: maxIndex + 1,
            modifiedAt: new Date().toISOString()
        };
        setBookmarks(prev => [...prev, newBookmark]);
    }, [bookmarks]);

    const updateBookmark = useCallback((id, changes) => {
        setBookmarks(prev => prev.map(bookmark => 
            bookmark.id === id 
                ? { 
                    ...bookmark, 
                    ...changes, 
                    modifiedAt: new Date().toISOString() 
                }
                : bookmark
        ));
    }, [bookmarks]);

    const deleteBookmark = useCallback((id) => {
        setBookmarks(prev => prev.map(bookmark => 
            bookmark.id === id 
                ? { 
                    ...bookmark, 
                    deleted: true, 
                    modifiedAt: new Date().toISOString() 
                }
                : bookmark
        ));
    }, [bookmarks]);

    const moveBookmark = useCallback((index, direction) => {
        const active = bookmarks.filter(b => !b.deleted).sort((a, b) => a.index - b.index);
        const currentIndex = active.findIndex(b => b.index === index);
        
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' 
            ? Math.max(0, currentIndex - 1)
            : Math.min(active.length - 1, currentIndex + 1);
            
        if (newIndex === currentIndex) return;
        
        // Swap index values between current and target bookmarks
        const current = active[currentIndex];
        const target = active[newIndex];
        
        setBookmarks(prev => prev.map(bookmark => {
            if (bookmark.index === current.index) {
                return { ...bookmark, index: target.index, modifiedAt: new Date().toISOString() };
            }
            if (bookmark.index === target.index) {
                return { ...bookmark, index: current.index, modifiedAt: new Date().toISOString() };
            }
            return bookmark;
        }));
    }, [bookmarks]);

    const exportBookmark = useCallback((id) => {
        // Get the bookmark data and copy the JSON string to clipboard
        const active = bookmarks.filter(b => !b.deleted)
        const bookmark = active.find(b => b.id === id && !b.deleted);
        if (!bookmark) return null;
        const dataStr = JSON.stringify({title: bookmark.title, timezone: bookmark.timezone}, null, 2);
        navigator.clipboard.writeText(dataStr);
        // TODO Push notification banner w/ message "Exported to clipboard"
    }, [bookmarks]);
    
    const createRemote = async (bookmarkData) => {
        const response = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookmarkData)
        });
        if (!response.ok) {
            console.error('Failed to create bookmark');
            showNotification('Failed to create bookmark', 'error', true);
            return null;
        }
        const newBookmark = await response.json();
        setBookmarks(prev => [...prev, newBookmark]);
        return;
    }

    const updateRemote = async (id, changes) => {
        const response = await fetch('/api/bookmarks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, changes })
        });
        if (!response.ok) {
            console.error('Failed to update bookmark');
            showNotification('Failed to update bookmark', 'error', true);
            return;
        }
        const updatedBookmark = await response.json();
        setBookmarks(prev => prev.map(bookmark => bookmark.id === id ? updatedBookmark : bookmark));
    }

    const deleteRemote = async (id) => {
        const response = await fetch('/api/bookmarks', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (!response.ok) {
            console.error('Failed to delete bookmark');
            showNotification('Failed to delete bookmark', 'error', true);
            return;
        }
        const { modifiedAt } = await response.json();
        setBookmarks(prev => prev.map(bookmark => bookmark.id === id ? { ...bookmark, deleted: true, modifiedAt } : bookmark));
    }

    const moveRemote = async (index, direction) => {
        // Find BOTH bookmarks being swapped and send to server
        const indexMod = direction === 'up' ? -1 : 1;
        const currArrayIndex = activeBookmarks.findIndex(b => b.index === index);
        if (currArrayIndex + indexMod < 0 || currArrayIndex + indexMod >= activeBookmarks.length) return;
        const current = activeBookmarks[currArrayIndex];
        const target = activeBookmarks[currArrayIndex + indexMod];

        const response = await fetch('/api/bookmarks/swap', {    
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: current.index, to: target.index })
        });
        if (response.status === 409) {
            return; // no-op on conflict
        }
        if (!response.ok) {
            console.error('Failed to move bookmark');
            showNotification('Failed to move bookmark', 'error', true);
            return;
        }

        // note - response contains the timestamp of execution, we calculate the rest
        const data = (await response.json());

        const tempIndex = current.index;
        current.index = target.index;
        target.index = tempIndex;
        current.modifiedAt = data.modifiedAt;
        target.modifiedAt = data.modifiedAt;

        const updatedBookmarks = [current, target];
        setBookmarks(prev => prev.map(bookmark => {
            const updated = updatedBookmarks.find(b => b.id === bookmark.id);
            return updated ? updated : bookmark;
        }));
    }

    if (currentAuthState === AuthState.Authenticated) {
        return {
            bookmarks: activeBookmarks,
            addBookmark: createRemote,
            updateBookmark: updateRemote,
            deleteBookmark: deleteRemote,
            moveBookmark: moveRemote,
            exportBookmark
        };
    }

    return {
        bookmarks: activeBookmarks,
        addBookmark,
        updateBookmark,
        deleteBookmark,
        moveBookmark,
        exportBookmark
    };
};

export default useBookmarks;