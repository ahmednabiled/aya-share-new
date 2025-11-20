import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Mic, 
  Upload, 
  LogOut, 
  History, 
  User, 
  Play, 
  Pause, 
  Square, 
  ChevronLeft,
  Menu,
  Loader2,
  FileAudio,
  Share2,
  Download,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Link as LinkIcon,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import bgImage from "@assets/generated_images/Subtle_islamic_geometric_pattern_background_0586174c.png";

// Mock Data
const MOCK_AYA = {
  arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
  english: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
  surah: "Al-Fatiha",
  aya: 1
};

export default function Dashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [viewState, setViewState] = useState<"idle" | "recording" | "uploading" | "processing" | "result">("idle");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  // Mock Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handlers
  const handleLogout = () => setLocation("/");
  
  const startRecording = () => {
    setViewState("recording");
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setViewState("processing");
    // Mock processing time
    setTimeout(() => {
      setViewState("result");
      toast({
        title: "Processing Complete",
        description: "We found the matching Aya for your recitation.",
      });
    }, 3000);
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setAudioFile(acceptedFiles[0]);
      setViewState("processing");
      // Mock processing
      setTimeout(() => {
        setViewState("result");
      }, 3000);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': [] },
    maxFiles: 1
  });

  const reset = () => {
    setViewState("idle");
    setAudioFile(null);
    setRecordingTime(0);
  };

  const handleShare = (platform: string) => {
    toast({
      title: "Shared Successfully",
      description: `Your video has been shared to ${platform}`,
    });
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
        
        <div className="flex-1 py-6 flex flex-col gap-2 px-3">
          <NavButton icon={<User />} label="Profile" isOpen={isSidebarOpen} active={false} />
          <NavButton icon={<History />} label="Recordings" isOpen={isSidebarOpen} active={false} />
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
              <Button variant="ghost" className="justify-start"><User className="mr-2 h-4 w-4"/> Profile</Button>
              <Button variant="ghost" className="justify-start"><History className="mr-2 h-4 w-4"/> Recordings</Button>
              <Separator />
              <Button variant="ghost" className="justify-start text-destructive" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
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
                    onClick={() => {}} // Handled by dropzone
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
                  <h3 className="text-xl font-serif">Analyzing Recitation...</h3>
                  <p className="text-muted-foreground">Finding the matching verses in the Quran</p>
                </div>
              </motion.div>
            )}

            {/* STATE: RESULT */}
            {viewState === "result" && (
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
                     <Dialog>
                       <DialogTrigger asChild>
                         <Button variant="outline" className="gap-2" data-testid="btn-share">
                           <Share2 className="h-4 w-4"/> Share
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-md">
                         <DialogHeader>
                           <DialogTitle>Share Recitation</DialogTitle>
                           <DialogDescription>
                             Share your video to social media or copy the link.
                           </DialogDescription>
                         </DialogHeader>
                         <div className="flex flex-col gap-4 py-4">
                           <div className="grid grid-cols-4 gap-2">
                             <ShareButton 
                               icon={<Facebook className="h-5 w-5" />} 
                               label="Facebook" 
                               onClick={() => handleShare("Facebook")}
                               className="hover:text-[#1877F2] hover:bg-[#1877F2]/10"
                             />
                             <ShareButton 
                               icon={<Twitter className="h-5 w-5" />} 
                               label="X" 
                               onClick={() => handleShare("X")}
                               className="hover:text-black hover:bg-black/10 dark:hover:text-white dark:hover:bg-white/10"
                             />
                             <ShareButton 
                               icon={<Instagram className="h-5 w-5" />} 
                               label="Instagram" 
                               onClick={() => handleShare("Instagram")}
                               className="hover:text-[#E4405F] hover:bg-[#E4405F]/10"
                             />
                             <ShareButton 
                               icon={
                                 <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                   <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                 </svg>
                               } 
                               label="TikTok" 
                               onClick={() => handleShare("TikTok")}
                               className="hover:text-[#000000] hover:bg-[#000000]/10 dark:hover:text-white dark:hover:bg-white/10"
                             />
                           </div>
                           <Separator />
                           <div className="flex items-center space-x-2">
                             <div className="grid flex-1 gap-2">
                               <Label htmlFor="link" className="sr-only">
                                 Link
                               </Label>
                               <Input
                                 id="link"
                                 defaultValue="https://ayashare.com/v/8x9s2"
                                 readOnly
                               />
                             </div>
                             <Button type="submit" size="sm" className="px-3" onClick={() => handleShare("Clipboard")}>
                               <span className="sr-only">Copy</span>
                               <LinkIcon className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                       </DialogContent>
                     </Dialog>
                     
                     <Button variant="outline" size="icon"><Download className="h-4 w-4"/></Button>
                   </div>
                </div>

                <Card className="overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-md">
                  <div className="relative aspect-video bg-black/5 flex flex-col items-center justify-center p-12 text-center space-y-8 group">
                     <div 
                        className="absolute inset-0 z-0 opacity-30 pointer-events-none"
                        style={{
                          backgroundImage: `url(${bgImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                    
                    <div className="relative z-10 space-y-8">
                      <p className="text-4xl md:text-5xl leading-relaxed font-arabic text-primary" dir="rtl">
                        {MOCK_AYA.arabic}
                      </p>
                      <p className="text-lg md:text-xl font-serif text-foreground/80 max-w-2xl mx-auto">
                        {MOCK_AYA.english}
                      </p>
                      <div className="inline-block px-4 py-1 rounded-full border border-accent/50 bg-accent/10 text-accent-foreground text-sm font-medium">
                        Surah {MOCK_AYA.surah} • Aya {MOCK_AYA.aya}
                      </div>
                    </div>

                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-4">
                        <Button size="icon" className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                          <Play className="h-5 w-5 ml-1" />
                        </Button>
                        <div className="flex-1 h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-primary rounded-full" />
                        </div>
                        <span className="text-xs font-medium tabular-nums">00:12</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Helper Components

function NavButton({ icon, label, isOpen, active }: { icon: React.ReactNode, label: string, isOpen: boolean, active: boolean }) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={`w-full justify-start h-12 ${!isOpen && "justify-center px-0"} ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70"}`}
    >
      <span className="mr-0">{icon}</span>
      {isOpen && <span className="ml-3 font-medium">{label}</span>}
    </Button>
  );
}

function ActionCard({ icon, title, description, onClick, active = false, testId }: any) {
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

function ShareButton({ icon, label, onClick, className }: any) {
  return (
    <Button
      variant="ghost"
      className={`flex flex-col items-center justify-center h-20 gap-2 transition-colors ${className}`}
      onClick={onClick}
    >
      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </Button>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
