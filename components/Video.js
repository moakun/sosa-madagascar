"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function Video() {
  const videos = [
    {
      id: 1,
      title: "Première Partie",
      url: "https://d21ulo4r1z07kx.cloudfront.net/CongoPartOne.mp4",
    },
    {
      id: 2,
      title: "Deuxième Partie",
      url: "https://d21ulo4r1z07kx.cloudfront.net/CongoPartTwo.mp4",
    },
  ];

  const { data: session, status } = useSession();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoStates, setVideoStates] = useState({ 
    video1: { watched: false, loading: false },
    video2: { watched: false, loading: false }
  });
  const router = useRouter();

  // Fetch initial video states
  useEffect(() => {
    if (status === "loading" || !session?.user?.email) return;
    
    const fetchVideoStatus = async () => {
      try {
        const response = await fetch(
          `/api/video?email=${encodeURIComponent(session.user.email)}`
        );
        
        if (!response.ok) throw new Error("Failed to fetch video status");
        
        const data = await response.json();
        
        if (data.success) {
          setVideoStates({
            video1: { watched: data.videoStatus.video1Status === "Regardé", loading: false },
            video2: { watched: data.videoStatus.video2Status === "Regardé", loading: false }
          });
        }
      } catch (error) {
        console.error("Error fetching video status:", error);
        toast({
          title: "Error",
          description: "Could not load video status",
          variant: "destructive",
        });
      }
    };

    fetchVideoStatus();
  }, [session, status]);

  const handleWatchNow = async (videoId) => {
    if (!session?.user?.email) return;
    
    const videoKey = `video${videoId}`;
    
    // Start playing the video immediately
    setCurrentVideo(videoId);
    
    // If already watched, we don't need to update the status again
    if (videoStates[videoKey].watched) return;
    
    // Prevent multiple clicks while processing
    if (videoStates[videoKey].loading) return;
    
    try {
      // Set loading state
      setVideoStates(prev => ({
        ...prev,
        [videoKey]: { ...prev[videoKey], loading: true }
      }));
      
      // Mark as watched in database
      const response = await fetch("/api/video", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          [videoKey]: true
        }),
      });

      if (!response.ok) throw new Error("Failed to update video status");
      
      // Update local state only after successful API call
      setVideoStates(prev => ({
        ...prev,
        [videoKey]: { watched: true, loading: false }
      }));
      
    } catch (error) {
      console.error("Error updating video status:", error);
      toast({
        title: "Error",
        description: "Could not mark video as watched",
        variant: "destructive",
      });
      
      // Reset loading state on error
      setVideoStates(prev => ({
        ...prev,
        [videoKey]: { ...prev[videoKey], loading: false }
      }));
    }
  };

  const allVideosWatched = videoStates.video1.watched && videoStates.video2.watched;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black-600 mb-6">Vidéos du cours</h1>
        <p className="text-black-500 mb-8">Choisissez une vidéo à regarder.</p>

        <div className="space-y-6">
          {videos.map((video) => {
            const videoKey = `video${video.id}`;
            const { watched, loading } = videoStates[videoKey];
            
            return (
              <div
                key={video.id}
                className="p-6 rounded-lg shadow-lg bg-white-500 text-black-600 flex items-center justify-between"
              >
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">{video.title}</h2>
                  {watched && <p className="text-green-500 font-medium">Déjà vu</p>}
                </div>
                <button
                  onClick={() => handleWatchNow(video.id)}
                  className={`px-4 py-2 rounded-lg shadow transition-all ${
                    loading
                      ? "bg-blue-300 text-black cursor-wait"
                      : "bg-blue-500 text-white-500 hover:bg-blue-600"
                  }`}
                >
                  {loading ? "Enregistrement..." : "Regarder"}
                </button>
              </div>
            );
          })}
        </div>

        {currentVideo && (
          <div className="mt-8 bg-white-500 shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-black-600 mb-4">Lecture en cours</h2>
            <div className="flex justify-center">
              <video
                controls
                autoPlay
                className="w-full max-w-3xl rounded-lg shadow-md"
                src={videos.find((v) => v.id === currentVideo)?.url}
              />
            </div>
          </div>
        )}

        {allVideosWatched && (
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-blue-500 text-white-500 font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition-all"
            >
              Retour au tableau de bord
            </button>
          </div>
        )}
      </div>
    </div>
  );
}