import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { 
  Mic, 
  Upload, 
  LogOut, 
  History, 
  User, 
  Play, 
  Square, 
  ChevronLeft,
  Menu,
  Loader2,
  Share2,
  Download,
  Trash2,
  Video as VideoIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useVideos, useCreateVideo, useDeleteVideo } from "@/hooks/use-videos";
import { Video } from "@/types/api";
import bgImage from "@assets/generated_images/Subtle_islamic_geometric_pattern_background_0586174c.png";

export default function Dashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  
  // API Hooks
  const { data: videos = [], isLoading: isLoadingVideos } = useVideos();
  const createVideoMutation = useCreateVideo();
  const deleteVideoMutation = useDeleteVideo();
  
  const [viewState, setViewState] = useState<"idle" | "recording" | "uploading" | "processing" | "result" | "history">("idle");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Handlers
  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setViewState("recording");
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setViewState("processing");
    
    // Wait for blob to be ready, then upload
    setTimeout(() => {
      if (chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        uploadAudio(blob);
      }
    }, 100);
  };

  const uploadAudio = async (blob: Blob) => {
    const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
    
    try {
      const video = await createVideoMutation.mutateAsync(file);
      setSelectedVideo(video);
      setViewState("result");
      toast({
        title: "Video Created!",
        description: "Your recitation video has been generated.",
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: String(error),
        variant: "destructive",
      });
      setViewState("idle");
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setViewState("processing");
      
      try {
        const video = await createVideoMutation.mutateAsync(acceptedFiles[0]);
        setSelectedVideo(video);
        setViewState("result");
        toast({
          title: "Video Created!",
          description: "Your recitation video has been generated.",
        });
      } catch (error) {
        toast({
          title: "Processing Failed",
          description: String(error),
          variant: "destructive",
        });
        setViewState("idle");
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': [] },
    maxFiles: 1
  });

  const reset = () => {
    setViewState("idle");
    setSelectedVideo(null);
    setRecordingTime(0);
    setAudioBlob(null);
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await deleteVideoMutation.mutateAsync(videoId);
      toast({
        title: "Video Deleted",
        description: "The video has been removed.",
      });
      if (selectedVideo?.id === videoId) {
        reset();
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const showHistory = () => {
    setViewState("history");
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col border-r bg-sidebar/50 backdrop-blur-sm transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-72" : "w-20"} z-20`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <span className="font-serif text-xl font-bold text-primary">Aya share</span>}
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} data-testid="btn-toggle-sidebar">
            <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${!isSidebarOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>
        
        {/* User Info */}
        {isSidebarOpen && user && (
          <div className="px-6 py-4 border-b">
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}
        
        <div className="flex-1 py-6 flex flex-col gap-2 px-3">
          <NavButton 
            icon={<VideoIcon />} 
            label="Create Video" 
            isOpen={isSidebarOpen} 
            active={viewState === "idle" || viewState === "recording" || viewState === "processing" || viewState === "result"} 
            onClick={reset}
          />
          <NavButton 
            icon={<History />} 
            label="My Videos" 
            isOpen={isSidebarOpen} 
            active={viewState === "history"} 
            onClick={showHistory}
          />
        </div>

        <div className="p-4 border-t border-sidebar-border">
           <Button 
            variant="ghost" 
            className={`w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 ${!isSidebarOpen && "justify-center px-0"}`}
            onClick={handleLogout}
            data-testid="btn-logout"
          >
            <LogOut className="h-5 w-5 mr-2" />
            {isSidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur z-50 flex items-center px-4 justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="mt-8 flex flex-col gap-4">
              {user && (
                <div className="pb-4 border-b">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              )}
              <Button variant="ghost" className="justify-start" onClick={reset}>
                <VideoIcon className="mr-2 h-4 w-4"/> Create Video
              </Button>
              <Button variant="ghost" className="justify-start" onClick={showHistory}>
                <History className="mr-2 h-4 w-4"/> My Videos
              </Button>
              <Separator />
              <Button variant="ghost" className="justify-start text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4"/> Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <span className="font-serif text-lg font-bold text-primary">Aya share</span>
        <div className="w-10"></div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative h-full pt-16 md:pt-0 overflow-hidden">
         {/* Background Pattern */}
        <div 
          className="absolute inset-0 z-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 md:p-12">
          <AnimatePresence mode="wait">
            
            {/* STATE: IDLE */}
            {viewState === "idle" && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid gap-8 md:grid-cols-2 w-full max-w-4xl"
              >
                <ActionCard 
                  icon={<Mic className="h-12 w-12 text-primary" />}
                  title="Record Online"
                  description="Recite directly into your microphone"
                  onClick={startRecording}
                  testId="card-record"
                />
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <ActionCard 
                    icon={<Upload className="h-12 w-12 text-accent" />}
                    title="Upload Audio"
                    description="Upload an existing MP3 or WAV file"
                    onClick={() => {}}
                    active={isDragActive}
                    testId="card-upload"
                  />
                </div>
              </motion.div>
            )}

            {/* STATE: RECORDING */}
            {viewState === "recording" && (
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center space-y-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-primary">
                    <Mic className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-serif text-primary">Recording...</h2>
                  <p className="text-4xl font-mono text-muted-foreground w-[120px]">
                    {formatTime(recordingTime)}
                  </p>
                </div>
                <div className="flex gap-4">
                   <Button 
                    size="lg" 
                    variant="destructive" 
                    className="h-16 w-16 rounded-full"
                    onClick={stopRecording}
                    data-testid="btn-stop-recording"
                  >
                    <Square className="h-6 w-6 fill-current" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STATE: PROCESSING */}
            {viewState === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center space-y-6"
              >
                <Loader2 className="h-16 w-16 text-accent animate-spin" />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-serif">Creating Your Video...</h3>
                  <p className="text-muted-foreground">This may take a few minutes</p>
                </div>
              </motion.div>
            )}

            {/* STATE: RESULT */}
            {viewState === "result" && selectedVideo && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                   <Button variant="ghost" onClick={reset} className="hover:bg-transparent pl-0 hover:text-primary">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                   </Button>
                   <div className="flex gap-2">
                     <Button variant="outline" size="icon" asChild>
                       <a href={selectedVideo.url} download target="_blank">
                         <Download className="h-4 w-4"/>
                       </a>
                     </Button>
                     <Button 
                       variant="outline" 
                       size="icon"
                       onClick={() => handleDeleteVideo(selectedVideo.id)}
                       disabled={deleteVideoMutation.isPending}
                     >
                       <Trash2 className="h-4 w-4 text-destructive"/>
                     </Button>
                   </div>
                </div>

                <Card className="overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-md">
                  <div className="relative aspect-video bg-black">
                    <video 
                      src={selectedVideo.url} 
                      controls 
                      className="w-full h-full"
                    />
                  </div>
                </Card>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(selectedVideo.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            )}

            {/* STATE: HISTORY */}
            {viewState === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-4xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-bold">My Videos</h2>
                  <Button onClick={reset}>
                    <Mic className="mr-2 h-4 w-4" /> New Recording
                  </Button>
                </div>

                {isLoadingVideos ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : videos.length === 0 ? (
                  <Card className="p-12 text-center">
                    <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No videos yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first video by recording or uploading audio</p>
                    <Button onClick={reset}>Create Video</Button>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video) => (
                      <Card key={video.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                        <div 
                          className="aspect-video bg-black relative"
                          onClick={() => {
                            setSelectedVideo(video);
                            setViewState("result");
                          }}
                        >
                          <video 
                            src={video.url} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="h-12 w-12 text-white" />
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium truncate">{video.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(video.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVideo(video.id);
                              }}
                              disabled={deleteVideoMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Helper Components

function NavButton({ icon, label, isOpen, active, onClick }: { icon: React.ReactNode, label: string, isOpen: boolean, active: boolean, onClick: () => void }) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={`w-full justify-start h-12 ${!isOpen && "justify-center px-0"} ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70"}`}
      onClick={onClick}
    >
      <span className="mr-0">{icon}</span>
      {isOpen && <span className="ml-3 font-medium">{label}</span>}
    </Button>
  );
}

function ActionCard({ icon, title, description, onClick, active = false, testId }: { icon: React.ReactNode, title: string, description: string, onClick: () => void, active?: boolean, testId: string }) {
  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 ${active ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/20'}`}
      onClick={onClick}
      data-testid={testId}
    >
      <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-4">
        <div className={`p-4 rounded-full bg-secondary transition-colors group-hover:bg-secondary/80 ${active ? 'bg-primary/20' : ''}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
