import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, increment, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useViewCounter() {
    const [views, setViews] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only run on client side and if db is initialized
        if (typeof window === "undefined") return;

        if (!db) {
            console.warn("Firestore not initialized");
            setLoading(false);
            return;
        }

        const counterRef = doc(db, "stats", "views");

        // Real-time listener
        const unsubscribe = onSnapshot(counterRef, (docSnap) => {
            if (docSnap.exists()) {
                setViews(docSnap.data().count || 0);
            } else {
                // Initialize if not exists
                setDoc(counterRef, { count: 1 }, { merge: true });
                setViews(1);
            }
            setLoading(false);
        });

        // Increment if first visit in this session
        const hasViewed = sessionStorage.getItem("orbital_viewed");
        if (!hasViewed) {
            getDoc(counterRef).then((snap) => {
                if (snap.exists()) {
                    updateDoc(counterRef, {
                        count: increment(1)
                    });
                } else {
                    setDoc(counterRef, { count: 1 });
                }
            });
            sessionStorage.setItem("orbital_viewed", "true");
        }

        return () => unsubscribe();
    }, []);

    return { views, loading };
}
