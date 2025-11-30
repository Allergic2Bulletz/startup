import { useState, useEffect, useCallback, useMemo } from 'react';

const useBookmarks = () => {
    const [bookmarks, setBookmarks] = useState([]);

    // Load bookmarks from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('bookmarks');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setBookmarks(parsed);
            } catch (error) {
                console.error('Failed to load bookmarks from localStorage:', error);
            }
        }
    }, []);

    // Auto-save to localStorage when bookmarks change
    useEffect(() => {
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    // Get active (non-deleted) bookmarks, sorted by modifiedAt for display order
    const activeBookmarks = useMemo(() => 
        bookmarks
            .filter(bookmark => !bookmark.deleted)
            .sort((a, b) => new Date(a.modifiedAt) - new Date(b.modifiedAt)),
        [bookmarks]
    );

    const addBookmark = useCallback((bookmarkData) => {
        const newBookmark = {
            id: crypto.randomUUID(),
            name: bookmarkData.name,
            timezone: bookmarkData.timezone,
            deleted: false,
            modifiedAt: new Date().toISOString()
        };
        setBookmarks(prev => [...prev, newBookmark]);
    }, []);

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
    }, []);

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
    }, []);

    const moveBookmark = useCallback((id, direction) => {
        const currentIndex = activeBookmarks.findIndex(b => b.id === id);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' 
            ? Math.max(0, currentIndex - 1)
            : Math.min(activeBookmarks.length - 1, currentIndex + 1);

        if (newIndex === currentIndex) return;

        // Update modifiedAt timestamps to reflect new order
        const now = new Date();
        const updates = [];
        
        if (direction === 'up') {
            // Moving up: set timestamp slightly before the item above
            const targetTime = new Date(activeBookmarks[newIndex].modifiedAt);
            targetTime.setSeconds(targetTime.getSeconds() - 1);
            updates.push({ id, modifiedAt: targetTime.toISOString() });
        } else {
            // Moving down: set timestamp slightly after the item below
            const targetTime = new Date(activeBookmarks[newIndex].modifiedAt);
            targetTime.setSeconds(targetTime.getSeconds() + 1);
            updates.push({ id, modifiedAt: targetTime.toISOString() });
        }

        setBookmarks(prev => prev.map(bookmark => {
            const update = updates.find(u => u.id === bookmark.id);
            return update ? { ...bookmark, ...update } : bookmark;
        }));
    }, [activeBookmarks]);

    return {
        bookmarks: activeBookmarks,
        addBookmark,
        updateBookmark,
        deleteBookmark,
        moveBookmark
    };
};

export default useBookmarks;