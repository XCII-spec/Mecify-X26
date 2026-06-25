import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";

import NavigationTracker from "@/lib/NavigationTracker";

import { pagesConfig } from "./pages.config";

import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import PageNotFound from "@/components/PageNotFound";

import { AuthProvider } from "@/lib/AuthContext";
import { DarkModeProvider } from "@/lib/DarkModeContext";

import ProtectedRoute from "@/components/ProtectedRoute";
import Subscribe from "@/pages/Subscribe";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
