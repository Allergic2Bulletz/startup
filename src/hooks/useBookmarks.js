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

    // Get active (non-deleted) bookmarks, sorted by order index
    const activeBookmarks = useMemo(() => 
        bookmarks
            .filter(bookmark => !bookmark.deleted)
            .sort((a, b) => a.order - b.order),
        [bookmarks]
    );

    const addBookmark = useCallback((bookmarkData) => {
        const maxOrder = bookmarks
            .filter(b => !b.deleted)
            .reduce((max, b) => Math.max(max, b.order || 0), -1);
        
        const newBookmark = {
            id: crypto.randomUUID(),
            name: bookmarkData.name,
            timezone: bookmarkData.timezone,
            deleted: false,
            order: maxOrder + 1,
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
        const active = bookmarks.filter(b => !b.deleted).sort((a, b) => a.order - b.order);
        const currentIndex = active.findIndex(b => b.id === id);
        
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' 
            ? Math.max(0, currentIndex - 1)
            : Math.min(active.length - 1, currentIndex + 1);
            
        if (newIndex === currentIndex) return;
        
        // Swap order values between current and target bookmarks
        const current = active[currentIndex];
        const target = active[newIndex];
        
        setBookmarks(prev => prev.map(bookmark => {
            if (bookmark.id === current.id) {
                return { ...bookmark, order: target.order, modifiedAt: new Date().toISOString() };
            }
            if (bookmark.id === target.id) {
                return { ...bookmark, order: current.order, modifiedAt: new Date().toISOString() };
            }
            return bookmark;
        }));
    }, [bookmarks]);

    return {
        bookmarks: activeBookmarks,
        addBookmark,
        updateBookmark,
        deleteBookmark,
        moveBookmark
    };
};

export default useBookmarks;