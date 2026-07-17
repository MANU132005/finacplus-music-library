import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { songService } from '../services/songService';
import { Song, SongFormData } from '../types/song';

/**
 * Custom hook to fetch songs using TanStack React Query.
 * Decoupled from the components using clean queries.
 */
export const useSongsQuery = (term: string = 'rock') => {
  return useQuery<Song[], Error>({
    queryKey: ['songs', term],
    queryFn: () => songService.getSongs(term),
    staleTime: 5 * 60 * 1000, // 5 minutes cache lifetime before considered stale
    refetchOnWindowFocus: false,
  });
};

/**
 * Custom mutation hook to add a new song.
 * Updates the query cache on success without requiring a full page refresh.
 */
export const useAddSongMutation = (term: string = 'rock') => {
  const queryClient = useQueryClient();

  return useMutation<Song, Error, SongFormData>({
    mutationFn: songService.addSong,
    onSuccess: (newSong) => {
      // Direct cache updates for maximum speed
      queryClient.setQueryData<Song[]>(['songs', term], (oldSongs: Song[] | undefined) => {
        return oldSongs ? [newSong, ...oldSongs] : [newSong];
      });

      // Also invalidate to keep remote MFE synchronized
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
};

/**
 * Custom mutation hook to delete a song.
 * Uses Optimistic UI to remove the song instantly, with full rollback support on failure.
 */
export const useDeleteSongMutation = (term: string = 'rock') => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previousSongs?: Song[] }>({
    mutationFn: songService.deleteSong,
    // Step 1: Optimistic cache update before firing the network request
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['songs', term] });

      // Snapshot the previous state
      const previousSongs = queryClient.getQueryData<Song[]>(['songs', term]);

      // Optimistically remove the song from the cache
      queryClient.setQueryData<Song[]>(['songs', term], (old: Song[] | undefined) => {
        return old ? old.filter((song: Song) => song.id !== deletedId) : [];
      });

      // Return context with snapshotted songs for rollback
      return { previousSongs };
    },
    // Step 2: If the mutation fails, rollback using our snapshotted context
    onError: (_err, _deletedId, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(['songs', term], context.previousSongs);
      }
    },
    // Step 3: Always refetch after success or failure to ensure client-server sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', term] });
    },
  });
};
