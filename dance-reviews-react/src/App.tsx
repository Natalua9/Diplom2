
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import UserDashboard from "./pages/UserDashboard";
import Directions from "./pages/Directions";
import DirectionDetail from "./pages/DirectionDetail";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminPerson from "./pages/AdminPerson";
import AdminDirection from "./pages/AdminDirection";
import AdminComments from "./pages/AdminComments";
import AdminSchedule from "./pages/AdminSchedule";
import AdminTeacher from "./pages/AdminTeacher";
import AdminInstructorStats from "./pages/AdminInstructorStats";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" expand closeButton />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/contacts" element={<Contact />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/directions" element={<Directions />} />
            <Route path="/directions/:slug" element={<DirectionDetail />} />
            <Route path="/admin/users" element={<AdminPerson />} />
            <Route path="/admin/directions" element={<AdminDirection />} />
            <Route path="/admin/comments" element={<AdminComments />} />
            <Route path="/admin/schedule" element={<AdminSchedule />} />
            <Route path="/admin/teachers" element={<AdminTeacher />} />
            <Route path="/admin/instructor-stats" element={<AdminInstructorStats />} />


            {/* Add more routes for other pages later */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
