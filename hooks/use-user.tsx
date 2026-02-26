import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { api } from '../convex/_generated/api';

export const useUser = () => {
    const { isSignedIn, isLoaded: clerkLoaded, getToken } = useAuth();
    const [syncAttempted, setSyncAttempted] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const user = useQuery(api.users.getCurrentUser);
    
    const syncUser = useMutation(api.users.syncUser);

    useEffect(() => {
        const syncUserData = async () => {

        if (!clerkLoaded) {
            return;
        }

        if (!isSignedIn) {
            setSyncAttempted(false);
            return;
        }

        if (user !== undefined) {
            setSyncAttempted(true);
            return;
        }

        if (user === undefined && !syncAttempted && !isSyncing) {
            try {
                setIsSyncing(true);
                
                const token = await getToken({ template: "convex" });
                
                if (!token) {
                    setSyncAttempted(false);
                    return;
                }

                await syncUser();
                setSyncAttempted(true);
                
            } catch (error) {
                setSyncAttempted(false);
            } finally {
                setIsSyncing(false);
            }
        }};

        syncUserData();
    }, [clerkLoaded, isSignedIn, user, syncUser, syncAttempted, isSyncing, getToken]);

    return {
        user,
        isLoading: user === undefined || isSyncing,
        isAdmin: user?.admin === true,
        isAuthenticated: isSignedIn,
    };
};