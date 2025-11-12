import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
// Lucide React is used for elegant icons
import { BedDouble, Coffee, ConciergeBell, Package, ChevronRight, ChevronDown, Image as ImageIcon, Star, Quote, ChevronUp, MessageSquare, Send, X, Facebook, Instagram, Linkedin, Twitter, Moon, Sun, Droplet } from 'lucide-react';
// Currency formatting utility
import { formatCurrency } from './utils/currency';

const getApiBaseUrl = () => {
    if (process.env.REACT_APP_API_BASE_URL) {
        return process.env.REACT_APP_API_BASE_URL;
    }

    if (typeof window !== "undefined") {
        const origin = window.location.origin;
        const path = window.location.pathname || "";

        if (path.startsWith("/resort")) {
            return `${origin}/resortapi/api`;
        }

        if (path.startsWith("/pommaholidays")) {
            return `${origin}/pommaapi/api`;
        }
    }

    return process.env.NODE_ENV === "production"
        ? "https://www.teqmates.com/pommaapi/api"
        : "http://localhost:8000/api";
};

// Custom hook to detect if an element is in the viewport
const useOnScreen = (ref, rootMargin = "0px") => {
    const [isIntersecting, setIntersecting] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIntersecting(entry.isIntersecting);
            },
            { rootMargin }
        );
        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, rootMargin]);
    return isIntersecting;
};

// Define the themes with a consistent structure for easy switching
const themes = {
    dark: {
        id: 'dark',
        name: 'Dark',
        icon: <Moon className="w-5 h-5" />,
        bgPrimary: "bg-black",
        bgSecondary: "bg-neutral-950",
        bgCard: "bg-white",
        textPrimary: "text-white",
        textSecondary: "text-neutral-400",
        textCardPrimary: "text-neutral-900",
        textCardSecondary: "text-neutral-600",
        textAccent: "text-amber-400",
        textCardAccent: "text-amber-600",
        textTitleGradient: "from-gray-200 via-white to-gray-400",
        border: "border-neutral-700",
        cardBorder: "border-neutral-200",
        borderHover: "hover:border-amber-500/50",
        buttonBg: "bg-amber-500",
        buttonText: "text-neutral-950",
        buttonHover: "hover:bg-amber-400",
        placeholderBg: "bg-neutral-800",
        placeholderText: "text-neutral-400",
        chatBg: "bg-neutral-900",
        chatHeaderBg: "bg-neutral-800",
        chatInputBorder: "border-neutral-700",
        chatInputBg: "bg-neutral-700",
        chatInputPlaceholder: "placeholder-neutral-400",
        chatUserBg: "bg-amber-500",
        chatUserText: "text-neutral-950",
        chatModelBg: "bg-neutral-800",
        chatModelText: "text-neutral-100",
        chatLoaderBg: "bg-neutral-400",
    },
    light: {
        id: 'light',
        name: 'Light',
        icon: <Sun className="w-5 h-5" />,
        bgPrimary: "bg-neutral-50",
        bgSecondary: "bg-neutral-200",
        bgCard: "bg-white",
        textPrimary: "text-neutral-900",
        textSecondary: "text-neutral-600",
        textCardPrimary: "text-neutral-900",
        textCardSecondary: "text-neutral-600",
        textAccent: "text-amber-600",
        textCardAccent: "text-amber-600",
        cardBorder: "border-neutral-300",
        textTitleGradient: "from-amber-600 via-amber-700 to-neutral-900",
        border: "border-neutral-300",
        borderHover: "hover:border-amber-500/50",
        buttonBg: "bg-gradient-to-r from-amber-500 to-amber-600",
        buttonText: "text-white",
        buttonHover: "hover:from-amber-400 hover:to-amber-500",
        placeholderBg: "bg-neutral-100",
        placeholderText: "text-neutral-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-neutral-100",
        chatInputBorder: "border-neutral-200",
        chatInputBg: "bg-neutral-100",
        chatInputPlaceholder: "placeholder-neutral-500",
        chatUserBg: "bg-gradient-to-r from-amber-500 to-amber-600",
        chatUserText: "text-white",
        chatModelBg: "bg-neutral-100",
        chatModelText: "text-neutral-900",
        chatLoaderBg: "bg-neutral-600",
    },
    ocean: {
        id: 'ocean',
        name: 'Ocean',
        icon: <Droplet className="w-5 h-5" />,
        bgPrimary: "bg-slate-50",
        bgSecondary: "bg-slate-100",
        bgCard: "bg-neutral-50",
        textPrimary: "text-slate-900",
        textSecondary: "text-slate-600",
        textAccent: "text-teal-600",
        textTitleGradient: "from-teal-700 via-cyan-700 to-blue-800",
        border: "border-slate-300",
        borderHover: "hover:border-teal-500/50",
        buttonBg: "bg-gradient-to-r from-teal-500 to-cyan-600",
        buttonText: "text-white",
        buttonHover: "hover:from-teal-400 hover:to-cyan-500",
        placeholderBg: "bg-slate-100",
        placeholderText: "text-slate-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-slate-100",
        chatInputBorder: "border-slate-200",
        chatInputBg: "bg-slate-100",
        chatInputPlaceholder: "placeholder-slate-500",
        chatUserBg: "bg-gradient-to-r from-teal-500 to-cyan-600",
        chatUserText: "text-white",
        chatModelBg: "bg-slate-100",
        chatModelText: "text-slate-900",
        chatLoaderBg: "bg-slate-600",
    },
    forest: {
        id: 'forest',
        name: 'Forest',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tree-pine"><path d="M17 19h2c.5 0 1-.5 1-1V9c0-2-3-3-3-3H8c-3 0-4 1.5-4 4.5v3.5c0 1.5 1 2 2 2h2"/><path d="M14 15v.5"/><path d="M13 14v.5"/><path d="M12 13v.5"/><path d="M11 12v.5"/><path d="M10 11v.5"/><path d="M9 10v.5"/><path d="M8 9v.5"/><path d="M17 14v.5"/><path d="M16 13v.5"/><path d="M15 12v.5"/><path d="M14 11v.5"/><path d="M13 10v.5"/><path d="M12 9v.5"/><path d="M11 8v.5"/><path d="M10 7v.5"/><path d="M9 6v.5"/><path d="M15 18v1"/><path d="M14 17v1"/><path d="M13 16v1"/><path d="M12 15v1"/><path d="M11 14v1"/><path d="M10 13v1"/><path d="M9 12v1"/><path d="M8 11v1"/><path d="M7 10v1"/><path d="M6 9v1"/><path d="M18 17v1"/><path d="M17 16v1"/><path d="M16 15v1"/><path d="M15 14v1"/><path d="M14 13v1"/><path d="M13 12v1"/><path d="M12 11v1"/><path d="M11 10v1"/><path d="M10 9v1"/><path d="M19 18v1"/><path d="M18 17v1"/><path d="M17 16v1"/><path d="M16 15v1"/><path d="M15 14v1"/><path d="M14 13v1"/><path d="M13 12v1"/><path d="M22 19v2"/><path d="M20 18v1"/><path d="M18 17v1"/><path d="M16 16v1"/><path d="M14 15v1"/><path d="M12 14v1"/><path d="M10 13v1"/><path d="M8 12v1"/><path d="M6 11v1"/><path d="M4 10v1"/><path d="M2 9v1"/><path d="M2 21h20"/><path d="m14 12-2-4-2 4"/><path d="m13 8-1-4-1 4"/><path d="M14 12c.5-1 1.5-2 2.5-3"/><path d="M10 12c-.5-1-1.5-2-2.5-3"/><path d="M12 22v-8"/><path d="m10 16-2 3"/><path d="m14 16 2 3"/></svg>,
        bgPrimary: "bg-green-50",
        bgSecondary: "bg-green-100",
        bgCard: "bg-neutral-50",
        textPrimary: "text-green-900",
        textSecondary: "text-green-600",
        textAccent: "text-emerald-600",
        textTitleGradient: "from-emerald-700 via-green-700 to-teal-800",
        border: "border-green-300",
        borderHover: "hover:border-emerald-500/50",
        buttonBg: "bg-gradient-to-r from-emerald-500 to-green-600",
        buttonText: "text-white",
        buttonHover: "hover:from-emerald-400 hover:to-green-500",
        placeholderBg: "bg-green-100",
        placeholderText: "text-green-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-green-100",
        chatInputBorder: "border-green-200",
        chatInputBg: "bg-green-100",
        chatInputPlaceholder: "placeholder-green-500",
        chatUserBg: "bg-gradient-to-r from-emerald-500 to-green-600",
        chatUserText: "text-white",
        chatModelBg: "bg-green-100",
        chatModelText: "text-green-900",
        chatLoaderBg: "bg-green-600",
    },
    rose: {
        id: 'rose',
        name: 'Rose',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flower"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5H12a4.5 4.5 0 1 1-4.5-4.5H12z"/><path d="M12 12a4.5 4.5 0 1 1 4.5 4.5H12a4.5 4.5 0 1 1-4.5-4.5H12z"/><path d="M12 12a4.5 4.5 0 1 1-4.5-4.5H12a4.5 4.5 0 1 1 4.5 4.5H12z"/><path d="M12 12a4.5 4.5 0 1 1 4.5 4.5H12a4.5 4.5 0 1 1-4.5-4.5H12z"/><path d="M7.5 12H12a4.5 4.5 0 0 0 4.5-4.5v-3a4.5 4.5 0 1 1 0 9v3a4.5 4.5 0 1 1 0-9h-4.5a4.5 4.5 0 0 0-4.5 4.5V12z"/></svg>,
        bgPrimary: "bg-pink-50",
        bgSecondary: "bg-pink-100",
        bgCard: "bg-neutral-50",
        textPrimary: "text-pink-900",
        textSecondary: "text-pink-600",
        textAccent: "text-rose-600",
        textTitleGradient: "from-rose-700 via-pink-700 to-fuchsia-800",
        border: "border-pink-300",
        borderHover: "hover:border-rose-500/50",
        buttonBg: "bg-gradient-to-r from-rose-500 to-pink-600",
        buttonText: "text-white",
        buttonHover: "hover:from-rose-400 hover:to-pink-500",
        placeholderBg: "bg-pink-100",
        placeholderText: "text-pink-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-pink-100",
        chatInputBorder: "border-pink-200",
        chatInputBg: "bg-pink-100",
        chatInputPlaceholder: "placeholder-pink-500",
        chatUserBg: "bg-gradient-to-r from-rose-500 to-pink-600",
        chatUserText: "text-white",
        chatModelBg: "bg-pink-100",
        chatModelText: "text-pink-900",
        chatLoaderBg: "bg-pink-600",
    },
    slate: {
        id: 'slate',
        name: 'Slate',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/></svg>,
        bgPrimary: "bg-gray-950",
        bgSecondary: "bg-gray-900",
        bgCard: "bg-neutral-50",
        textPrimary: "text-gray-100",
        textSecondary: "text-gray-400",
        textAccent: "text-sky-400",
        textTitleGradient: "from-gray-200 via-gray-400 to-gray-600",
        border: "border-gray-700",
        borderHover: "hover:border-sky-400/50",
        buttonBg: "bg-sky-500",
        buttonText: "text-gray-950",
        buttonHover: "hover:bg-sky-400",
        placeholderBg: "bg-gray-800",
        placeholderText: "text-gray-400",
        chatBg: "bg-gray-900",
        chatHeaderBg: "bg-gray-800",
        chatInputBorder: "border-gray-700",
        chatInputBg: "bg-gray-700",
        chatInputPlaceholder: "placeholder-gray-400",
        chatUserBg: "bg-sky-500",
        chatUserText: "text-gray-950",
        chatModelBg: "bg-gray-800",
        chatModelText: "text-gray-100",
        chatLoaderBg: "bg-gray-400",
    },
    sunrise: {
        id: 'sunrise',
        name: 'Sunrise',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sunrise"><path d="M12 2v2"/><path d="m5 10 1-1"/><path d="m19 10 1-1"/><path d="M12 16a6 6 0 0 0 0 12"/><path d="m3 16 1-1"/><path d="m21 16-1-1"/><path d="m8 20 2-2"/><path d="m16 20-2-2"/></svg>,
        bgPrimary: "bg-orange-50",
        bgSecondary: "bg-yellow-100",
        bgCard: "bg-neutral-50",
        textPrimary: "text-orange-900",
        textSecondary: "text-orange-600",
        textAccent: "text-red-500",
        textTitleGradient: "from-orange-500 via-yellow-600 to-red-700",
        border: "border-yellow-200",
        borderHover: "hover:border-red-500/50",
        buttonBg: "bg-red-500",
        buttonText: "text-white",
        buttonHover: "hover:bg-red-400",
        placeholderBg: "bg-yellow-50",
        placeholderText: "text-orange-400",
        chatBg: "bg-white",
        chatHeaderBg: "bg-yellow-100",
        chatInputBorder: "border-yellow-200",
        chatInputBg: "bg-yellow-100",
        chatInputPlaceholder: "placeholder-orange-500",
        chatUserBg: "bg-red-500",
        chatUserText: "text-white",
        chatModelBg: "bg-yellow-100",
        chatModelText: "text-orange-900",
        chatLoaderBg: "bg-red-600",
    },
    lavender: {
        id: 'lavender',
        name: 'Lavender',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lavender"><path d="M14.5 16.5c-2.4-1-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5C3.3 6.7 4 6 5 6c1.1 0 2.4.8 3.5 2.5 1.2 1.9 2 4.2 2.5 5.5.5 1.5 1 3.6 2 4.5 1 .8 2.2 1.3 3.5 1C17.3 17.3 18 16.6 18 15.6c0-1.1-.8-2.4-2.5-3.5-1.9-1.2-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5.3-1.3 1-2 2-2 1.1 0 2.4.8 3.5 2.5 1.9 1.2 4.2 2 5.5 2.5 1.5.5 3.6 1 4.5 2 .8 1 1.3 2.2 1 3.5-.3 1.3-1 2-2 2-1.1 0-2.4-.8-3.5-2.5-1.9-1.2-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5-.3-1.3-1-2-2-2-1.1 0-2.4-.8-3.5-2.5"/><path d="M12 12c-2.4-1-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5.3-1.3 1-2 2-2 1.1 0 2.4.8 3.5 2.5 1.9 1.2 4.2 2 5.5 2.5 1.5.5 3.6 1 4.5 2 .8 1 1.3 2.2 1 3.5-.3 1.3-1 2-2 2-1.1 0-2.4-.8-3.5-2.5"/><path d="M12 12c2.4-1 4.2-2 5.5-2.5 1.5-.5 3.6-1 4.5-2 .8-1 1.3 2.2 1-3.5-.3-1.3-1-2-2-2-1.1 0-2.4.8-3.5 2.5-1.9-1.2-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5-.3-1.3-1-2-2-2-1.1 0-2.4-.8-3.5-2.5"/></svg>,
        bgPrimary: "bg-indigo-950",
        bgSecondary: "bg-indigo-900",
        bgCard: "bg-neutral-50",
        textPrimary: "text-indigo-100",
        textSecondary: "text-indigo-300",
        textAccent: "text-violet-400",
        textTitleGradient: "from-indigo-200 via-violet-300 to-purple-400",
        border: "border-indigo-700",
        borderHover: "hover:border-violet-400/50",
        buttonBg: "bg-violet-500",
        buttonText: "text-indigo-950",
        buttonHover: "hover:bg-violet-400",
        placeholderBg: "bg-indigo-800",
        placeholderText: "text-indigo-400",
        chatBg: "bg-indigo-900",
        chatHeaderBg: "bg-indigo-800",
        chatInputBorder: "border-indigo-700",
        chatInputBg: "bg-indigo-700",
        chatInputPlaceholder: "placeholder-indigo-400",
        chatUserBg: "bg-violet-500",
        chatUserText: "text-indigo-950",
        chatModelBg: "bg-indigo-800",
        chatModelText: "text-indigo-100",
        chatLoaderBg: "bg-indigo-400",
    },
    desert: {
        id: 'desert',
        name: 'Desert',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sunrise"><path d="M12 2v2"/><path d="m5 10 1-1"/><path d="m19 10 1-1"/><path d="M12 16a6 6 0 0 0 0 12"/><path d="m3 16 1-1"/><path d="m21 16-1-1"/><path d="m8 20 2-2"/><path d="m16 20-2-2"/></svg>,
        bgPrimary: "bg-stone-100",
        bgSecondary: "bg-stone-200",
        bgCard: "bg-neutral-50",
        textPrimary: "text-stone-900",
        textSecondary: "text-stone-600",
        textAccent: "text-orange-700",
        textTitleGradient: "from-stone-700 via-stone-900 to-amber-900",
        border: "border-stone-300",
        borderHover: "hover:border-orange-700/50",
        buttonBg: "bg-orange-700",
        buttonText: "text-white",
        buttonHover: "hover:bg-orange-600",
        placeholderBg: "bg-stone-50",
        placeholderText: "text-stone-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-stone-100",
        chatInputBorder: "border-stone-200",
        chatInputBg: "bg-stone-100",
        chatInputPlaceholder: "placeholder-stone-500",
        chatUserBg: "bg-orange-700",
        chatUserText: "text-white",
        chatModelBg: "bg-stone-100",
        chatModelText: "text-stone-900",
        chatLoaderBg: "bg-stone-600",
    },
    grape: {
        id: 'grape',
        name: 'Grape',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grape"><path d="M22 6c0 4-4 8-10 8S2 10 2 6"/><path d="M12 14c-6 0-10 4-10 8s4 8 10 8"/><path d="M22 14c-6 0-10 4-10 8s4 8 10 8"/></svg>,
        bgPrimary: "bg-purple-950",
        bgSecondary: "bg-purple-900",
        bgCard: "bg-neutral-50",
        textPrimary: "text-purple-100",
        textSecondary: "text-purple-300",
        textAccent: "text-pink-400",
        textTitleGradient: "from-purple-200 via-pink-300 to-fuchsia-400",
        border: "border-purple-700",
        borderHover: "hover:border-pink-400/50",
        buttonBg: "bg-pink-500",
        buttonText: "text-purple-950",
        buttonHover: "hover:bg-pink-400",
        placeholderBg: "bg-purple-800",
        placeholderText: "text-purple-400",
        chatBg: "bg-purple-900",
        chatHeaderBg: "bg-purple-800",
        chatInputBorder: "border-purple-700",
        chatInputBg: "bg-purple-700",
        chatInputPlaceholder: "placeholder-purple-400",
        chatUserBg: "bg-pink-500",
        chatUserText: "text-purple-950",
        chatModelBg: "bg-purple-800",
        chatModelText: "text-purple-100",
        chatLoaderBg: "bg-purple-400",
    },
    sky: {
        id: 'sky',
        name: 'Sky',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-sun"><path d="M12 2v2"/><path d="m4.9 10 1-1"/><path d="m19.1 10-1-1"/><path d="M14 16a6 6 0 0 0 0 12"/><path d="m3 16 1-1"/><path d="m21 16-1-1"/><path d="m8 20 2-2"/><path d="m16 20-2-2"/></svg>,
        bgPrimary: "bg-sky-50",
        bgSecondary: "bg-sky-100",
        bgCard: "bg-neutral-50",
        textPrimary: "text-sky-900",
        textSecondary: "text-sky-600",
        textAccent: "text-blue-500",
        textTitleGradient: "from-sky-700 via-blue-800 to-indigo-900",
        border: "border-sky-300",
        borderHover: "hover:border-blue-500/50",
        buttonBg: "bg-blue-500",
        buttonText: "text-white",
        buttonHover: "hover:bg-blue-400",
        placeholderBg: "bg-sky-50",
        placeholderText: "text-sky-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-sky-100",
        chatInputBorder: "border-sky-200",
        chatInputBg: "bg-sky-100",
        chatInputPlaceholder: "placeholder-sky-500",
        chatUserBg: "bg-blue-500",
        chatUserText: "text-white",
        chatModelBg: "bg-sky-100",
        chatModelText: "text-sky-900",
        chatLoaderBg: "bg-blue-600",
    },
    fire: {
        id: 'fire',
        name: 'Fire',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flame"><path d="M18 10c-1.2-1.2-3-2-5-2-1.2 0-2.8.8-4 2-1.2 1.2-2 3-2 5-2.2 2.2-2.5 4.5-2.5 5.5s.8 1.5 1.5 1.5c.7 0 1.5-.8 1.5-1.5s.3-3.3 2.5-5.5c1.2-1.2 3-2 5-2 1.2 0 2.8.8 4 2 1.2 1.2 2 3 2 5 2.2 2.2 2.5 4.5 2.5 5.5s-.8 1.5-1.5 1.5c-.7 0-1.5-.8-1.5-1.5s-.3-3.3-2.5-5.5z"/></svg>,
        bgPrimary: "bg-red-950",
        bgSecondary: "bg-red-900",
        bgCard: "bg-neutral-50",
        textPrimary: "text-red-100",
        textSecondary: "text-red-300",
        textAccent: "text-orange-400",
        textTitleGradient: "from-orange-200 via-orange-300 to-yellow-400",
        border: "border-red-700",
        borderHover: "hover:border-orange-400/50",
        buttonBg: "bg-orange-500",
        buttonText: "text-red-950",
        buttonHover: "hover:bg-orange-400",
        placeholderBg: "bg-red-800",
        placeholderText: "text-red-400",
        chatBg: "bg-red-900",
        chatHeaderBg: "bg-red-800",
        chatInputBorder: "border-red-700",
        chatInputBg: "bg-red-700",
        chatInputPlaceholder: "placeholder-red-400",
        chatUserBg: "bg-orange-500",
        chatUserText: "text-red-950",
        chatModelBg: "bg-red-800",
        chatModelText: "text-red-100",
        chatLoaderBg: "bg-red-400",
    },
    mint: {
        id: 'mint',
        name: 'Mint',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-leaf"><path d="M2 13c3.5-3.5 12-5 18 0 0 0-4 4-8 8s-8-4-10-6z"/></svg>,
        bgPrimary: "bg-teal-50",
        bgSecondary: "bg-teal-100",
        bgCard: "bg-neutral-50",
        textPrimary: "text-teal-900",
        textSecondary: "text-teal-600",
        textAccent: "text-emerald-600",
        textTitleGradient: "from-teal-700 via-emerald-900 to-green-900",
        border: "border-teal-200",
        borderHover: "hover:border-emerald-600/50",
        buttonBg: "bg-emerald-600",
        buttonText: "text-white",
        buttonHover: "hover:bg-emerald-500",
        placeholderBg: "bg-teal-50",
        placeholderText: "text-teal-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-teal-100",
        chatInputBorder: "border-teal-200",
        chatInputBg: "bg-teal-100",
        chatInputPlaceholder: "placeholder-teal-500",
        chatUserBg: "bg-emerald-600",
        chatUserText: "text-white",
        chatModelBg: "bg-teal-100",
        chatModelText: "text-teal-900",
        chatLoaderBg: "bg-teal-600",
    },

};

// Background animation component for the floating bubbles
const BackgroundAnimation = ({ theme }) => {
    const bubbles = Array.from({ length: 30 }, (_, i) => { // Reduced bubble count for a smoother, more elegant effect
        const size = `${2 + Math.random() * 4}rem`;
        const animationDelay = `${Math.random() * 20}s`;
        const animationDuration = `${25 + Math.random() * 25}s`; // Longer duration for a calmer float
        const opacity = 0.1 + Math.random() * 0.15; // Reduced max opacity for a more subtle look

        let bubbleColor = "";
        switch (theme.id) {
            case 'dark': bubbleColor = "bg-white/20"; break;
            case 'light': bubbleColor = "bg-neutral-400"; break;
            case 'ocean': bubbleColor = "bg-cyan-400"; break;
            case 'forest': bubbleColor = "bg-lime-400"; break;
            case 'rose': bubbleColor = "bg-fuchsia-400"; break;
            case 'slate': bubbleColor = "bg-sky-400"; break;
            case 'sunrise': bubbleColor = "bg-red-400"; break;
            case 'lavender': bubbleColor = "bg-violet-400"; break;
            case 'desert': bubbleColor = "bg-orange-400"; break;
            case 'grape': bubbleColor = "bg-pink-400"; break;
            case 'sky': bubbleColor = "bg-blue-400"; break;
            case 'fire': bubbleColor = "bg-yellow-400"; break;
            case 'mint': bubbleColor = "bg-emerald-400"; break;
            default: bubbleColor = "bg-neutral-400";
        }
        
        const direction = Math.floor(Math.random() * 4);
        let style = {
            width: size,
            height: size,
            animationDelay,
            animationDuration,
            opacity,
        };
        let animationClass = "";

        switch (direction) {
            case 0: // from bottom to top
                style.bottom = '-10%';
                style.left = `${Math.random() * 100}%`;
                animationClass = 'bubble-up';
                break;
            case 1: // from left to right
                style.left = '-10%';
                style.top = `${Math.random() * 100}%`;
                animationClass = 'bubble-right';
                break;
            case 2: // from top to bottom
                style.top = '-10%';
                style.left = `${Math.random() * 100}%`;
                animationClass = 'bubble-down';
                break;
            case 3: // from right to left
            default:
                style.right = '-10%';
                style.top = `${Math.random() * 100}%`;
                animationClass = 'bubble-left';
                break;
        }

        return (
            <li
                key={i}
                className={`absolute rounded-full list-none block z-0 ${bubbleColor} ${animationClass}`}
                style={style}
            ></li>
        );
    });

    return (
        <>
            <style>{`
                /* Mountain Shadows Luxury Typography & Colors */
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
                
                :root {
                    --font-display: 'Playfair Display', serif;
                    --font-body: 'Inter', sans-serif;
                    --color-amber-primary: #f59e0b;
                    --color-amber-gold: #d97706;
                    --color-neutral-900: #171717;
                    --color-neutral-50: #fafafa;
                }
                
                * {
                    max-width: 100%;
                }
                
                body {
                    font-family: var(--font-body);
                    font-weight: 400;
                    letter-spacing: 0.01em;
                    overflow-x: hidden;
                }
                
                h1, h2, h3, h4, h5, h6 {
                    font-family: var(--font-display);
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    max-width: 100%;
                    word-wrap: break-word;
                }
                
                section {
                    width: 100%;
                    overflow-x: hidden;
                }
                
                img {
                    max-width: 100%;
                    height: auto;
                }
                
                .container-custom {
                    max-width: 95%;
                    margin-left: auto;
                    margin-right: auto;
                    padding-left: 1rem;
                    padding-right: 1rem;
                }
                
                @media (min-width: 640px) {
                    .container-custom {
                        max-width: 98%;
                        padding-left: 1.5rem;
                        padding-right: 1.5rem;
                    }
                }
                
                @media (min-width: 1024px) {
                    .container-custom {
                        max-width: 1400px;
                    }
                }
                
                /* Luxury Mountain Shadows Premium Styling */
                .luxury-card {
                    border-radius: 1rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .luxury-card:hover {
                    box-shadow: 0 20px 25px -5px rgba(245, 158, 11, 0.2), 0 10px 10px -5px rgba(245, 158, 11, 0.1);
                    transform: translateY(-4px) scale(1.01);
                }
                
                .premium-gradient {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
                }
                
                .premium-text-gradient {
                    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .luxury-overlay {
                    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%);
                }
                
                .section-badge {
                    display: inline-block;
                    padding: 0.5rem 1.5rem;
                    background: rgba(245, 158, 11, 0.1);
                    color: #d97706;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    border-radius: 9999px;
                    border: 1px solid rgba(245, 158, 11, 0.2);
                    backdrop-filter: blur(10px);
                }
                
                .luxury-shadow {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.05);
                }
                
                .card-image {
                    max-height: 200px;
                    object-fit: cover;
                    filter: brightness(1) saturate(1.1);
                    transition: all 0.5s ease;
                }
                
                .luxury-card:hover .card-image {
                    filter: brightness(1.05) saturate(1.2);
                }
                
                .card-title {
                    font-size: 1.125rem;
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                }
                
                .card-description {
                    font-size: 0.875rem;
                    line-height: 1.5;
                    color: #6b7280;
                }
                
                @keyframes slow-pan { 
                    0% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-3%, 3%) scale(1.05); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Lazy reveal utility - optimized for performance */
                .reveal { opacity: 0; transform: translateY(18px) scale(.98); filter: blur(6px); will-change: opacity, transform, filter; }
                .reveal.in { opacity: 1; transform: none; filter: blur(0); transition: opacity .2s ease, transform .2s ease, filter .2s ease; }
                @keyframes gentle-glow {
                    0%, 100% { filter: brightness(1) drop-shadow(0 0 20px rgba(245, 158, 11, 0.3)); }
                    50% { filter: brightness(1.1) drop-shadow(0 0 30px rgba(245, 158, 11, 0.5)); }
                }
                @keyframes gentle-pulse {
                    0%, 100% { box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3); }
                    50% { box-shadow: 0 15px 60px rgba(245, 158, 11, 0.6); }
                }
                @keyframes bubble-up { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(20px, -25vh) rotate(45deg); } 50% { transform: translate(-20px, -50vh) rotate(90deg); } 75% { transform: translate(20px, -75vh) rotate(135deg); } 100% { transform: translate(0, -110vh) rotate(180deg); } }
                @keyframes bubble-down { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-20px, 25vh) rotate(-45deg); } 50% { transform: translate(20px, 50vh) rotate(-90deg); } 75% { transform: translate(-20px, 75vh) rotate(-135deg); } 100% { transform: translate(0, 110vh) rotate(-180deg); } }
                @keyframes bubble-left { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-25vw, 20px) rotate(45deg); } 50% { transform: translate(-50vw, -20px) rotate(90deg); } 75% { transform: translate(-75vw, 20px) rotate(135deg); } 100% { transform: translate(-110vw, 0) rotate(180deg); } }
                @keyframes bubble-right { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(25vw, -20px) rotate(-45deg); } 50% { transform: translate(50vw, 20px) rotate(-90deg); } 75% { transform: translate(75vw, -20px) rotate(-135deg); } 100% { transform: translate(110vw, 0) rotate(-180deg); } }
                .bubble-up { animation: bubble-up ease-in-out infinite; }
                .bubble-down { animation: bubble-down ease-in-out infinite; }
                .bubble-left { animation: bubble-left ease-in-out infinite; }
                .bubble-right { animation: bubble-right ease-in-out infinite; }
            `}</style>
            <ul className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                {bubbles}
            </ul>
        </>
    );
};

/**
 * A helper function to ensure a URL is valid for an external link.
 * It prepends "https://" if the protocol is missing.
 * @param {string} url The URL to format.
 * @returns {string} A valid, absolute URL.
 */
const formatUrl = (url) => {
    if (!url || typeof url !== 'string') return '#'; // Return a safe, non-navigating link if URL is missing
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
};

export default function App() {
    const [rooms, setRooms] = useState([]);
    const [allRooms, setAllRooms] = useState([]); // Store all rooms for filtering
    const [bookings, setBookings] = useState([]); // Store bookings for availability check
    const [services, setServices] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [packages, setPackages] = useState([]);
    const [resortInfo, setResortInfo] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [bannerData, setBannerData] = useState([]);
    const [signatureExperiences, setSignatureExperiences] = useState([]);
    const [planWeddings, setPlanWeddings] = useState([]);
    const [nearbyAttractions, setNearbyAttractions] = useState([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [currentWeddingIndex, setCurrentWeddingIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        { role: "model", parts: [{ text: "Hello! I am your personal AI Concierge. How can I assist you with your stay at the Elysian Retreat today?" }] }
    ]);
    const [userMessage, setUserMessage] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [showAllRooms, setShowAllRooms] = useState(false);

    // Package image slider state
    const [packageImageIndex, setPackageImageIndex] = useState({});

    // Banner Message State
    const [bannerMessage, setBannerMessage] = useState({ type: null, text: "" });

    // Function to show banner message with auto-dismiss
    const showBannerMessage = (type, text) => {
        setBannerMessage({ type, text });
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setBannerMessage({ type: null, text: "" });
        }, 5000);
    };

    // Booking Modals State
    const [isRoomBookingFormOpen, setIsRoomBookingFormOpen] = useState(false);
    const [isPackageBookingFormOpen, setIsPackageBookingFormOpen] = useState(false);
    const [isPackageSelectionOpen, setIsPackageSelectionOpen] = useState(false);
    const [isServiceBookingFormOpen, setIsServiceBookingFormOpen] = useState(false);
    const [isFoodOrderFormOpen, setIsFoodOrderFormOpen] = useState(false);
    const [isGeneralBookingOpen, setIsGeneralBookingOpen] = useState(false);

    const [bookingData, setBookingData] = useState({
        room_ids: [],
        guest_name: "",
        guest_mobile: "",
        guest_email: "",
        check_in: "",
        check_out: "",
        adults: 1,
        children: 0,
    });
    const [packageBookingData, setPackageBookingData] = useState({
        package_id: null,
        room_ids: [],
        guest_name: "",
        guest_mobile: "",
        guest_email: "",
        check_in: "",
        check_out: "",
        adults: 1,
        children: 0,
    });
    const [serviceBookingData, setServiceBookingData] = useState({
        service_id: null,
        guest_name: "",
        guest_mobile: "",
        guest_email: "",
        room_id: null,
    });
    const [foodOrderData, setFoodOrderData] = useState({
        room_id: null,
        items: {},
    });

    const [bookingMessage, setBookingMessage] = useState({ type: null, text: "" });
    const [isBookingLoading, setIsBookingLoading] = useState(false);

    // Always use light theme - matching Mountain Shadows style
    const currentTheme = 'light';
    const theme = themes[currentTheme];

    const bannerRef = useRef(null);
    const chatMessagesRef = useRef(null);
    const isBannerVisible = useOnScreen(bannerRef);
    
    const ITEM_PLACEHOLDER = "https://placehold.co/400x300/2d3748/cbd5e0?text=Image+Not+Available";

    // Helper function to get correct image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return ITEM_PLACEHOLDER;
        if (imagePath.startsWith('http')) return imagePath; // Already a full URL
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://www.teqmates.com' 
            : 'http://localhost:8000';
        // Ensure imagePath starts with / for proper URL construction
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${baseUrl}${path}`;
    };

    // Determine gallery card height for a mosaic layout.
    // Specifically, for the SECOND ROW (indices 5-9), apply:
    // [tall, short, tall, tall, short]
    // For other rows, use a gentle alternating pattern for visual rhythm.
    const getGalleryCardHeight = (index) => {
        const columns = 5; // grid is 5 columns on desktop
        const rowIndex = Math.floor(index / columns);
        const colIndex = index % columns;

        // Heights in pixels
        const TALL = 440;
        const SHORT = 280;

        if (rowIndex === 1) {
            const secondRowPattern = [TALL, SHORT, TALL, TALL, SHORT];
            return `${secondRowPattern[colIndex]}px`;
        }

        // Default pattern for other rows (subtle variation)
        const defaultPattern = [320, 360, 300, 360, 320];
        return `${defaultPattern[colIndex]}px`;
    };

    // *** FIX: Added useEffect to fetch all resort data on component mount ***
    useEffect(() => {
        const fetchResortData = async () => {
            const API_BASE_URL = getApiBaseUrl();
            const endpoints = {
                rooms: '/rooms/test',  // Use working test endpoint for real room data
                bookings: '/bookings?limit=500&skip=0', // Reduced limit for better performance - only recent bookings needed
                foodItems: '/food-items',
                packages: '/packages',
                resortInfo: '/resort-info/',
                gallery: '/gallery/',
                reviews: '/reviews/',
                banners: '/header-banner/',
                services: '/services', // Fetch services (note: plural)
                signatureExperiences: '/signature-experiences/',
                planWeddings: '/plan-weddings/',
                nearbyAttractions: '/nearby-attractions/'
            };

            try {
                const entries = Object.entries(endpoints);
                const results = await Promise.all(
                    entries.map(async ([key, endpoint]) => {
                        try {
                            const response = await fetch(`${API_BASE_URL}${endpoint}`);
                            if (!response.ok) {
                                throw new Error(`HTTP ${response.status} for ${response.url}`);
                            }
                            const payload = await response.json();
                            return [key, payload];
                        } catch (fetchError) {
                            console.error(`Failed to fetch ${key}:`, fetchError);
                            return [key, null];
                        }
                    })
                );

                const dataMap = Object.fromEntries(results);
                const failedKeys = results.filter(([, value]) => value === null).map(([key]) => key);

                const roomsData = Array.isArray(dataMap.rooms) ? dataMap.rooms : [];
                const bookingsData = Array.isArray(dataMap.bookings?.bookings)
                    ? dataMap.bookings.bookings
                    : Array.isArray(dataMap.bookings)
                        ? dataMap.bookings
                        : [];
                const foodItemsData = Array.isArray(dataMap.foodItems) ? dataMap.foodItems : [];
                const packagesData = Array.isArray(dataMap.packages) ? dataMap.packages : [];
                const resortInfoList = Array.isArray(dataMap.resortInfo) ? dataMap.resortInfo : [];
                const galleryData = Array.isArray(dataMap.gallery) ? dataMap.gallery : [];
                const reviewsData = Array.isArray(dataMap.reviews) ? dataMap.reviews : [];
                const bannerData = Array.isArray(dataMap.banners) ? dataMap.banners : [];
                const servicesData = Array.isArray(dataMap.services) ? dataMap.services : [];
                const signatureExperiencesData = Array.isArray(dataMap.signatureExperiences) ? dataMap.signatureExperiences : [];
                const planWeddingsData = Array.isArray(dataMap.planWeddings) ? dataMap.planWeddings : [];
                const nearbyAttractionsData = Array.isArray(dataMap.nearbyAttractions) ? dataMap.nearbyAttractions : [];

                setAllRooms(roomsData);
                setBookings(bookingsData); // Store bookings for availability filtering
                setServices(servicesData); // Fetch services from backend
                setFoodItems(foodItemsData);
                setPackages(packagesData);
                setResortInfo(resortInfoList.length > 0 ? resortInfoList[0] : null);
                setGalleryImages(galleryData);
                setReviews(reviewsData);
                setBannerData(bannerData.filter(b => b?.is_active));
                setSignatureExperiences(signatureExperiencesData);
                setPlanWeddings(planWeddingsData);
                setNearbyAttractions(nearbyAttractionsData);

                if (failedKeys.length === entries.length) {
                    setError("Failed to load resort data. Please ensure the backend server is running and accessible.");
                } else {
                    if (failedKeys.length > 0) {
                        console.warn("Some resort endpoints failed to load:", failedKeys);
                    }
                    setError(null);
                }
            } catch (err) {
                console.error("Failed to fetch resort data:", err);
                setError("Failed to load resort data. Please ensure the backend server is running and accessible.");
            } finally {
                setLoading(false);
            }
        };

        fetchResortData();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Auto-rotate banner images - only if multiple banners
    useEffect(() => {
        if (bannerData.length > 1) {
            const interval = setInterval(() => {
                setCurrentBannerIndex((prev) => (prev + 1) % bannerData.length);
            }, 9000); // Slower transition: change image every 9 seconds
            return () => clearInterval(interval);
        } else if (bannerData.length === 1) {
            setCurrentBannerIndex(0); // Ensure first banner is shown
        }
    }, [bannerData.length]);

    // Auto-change wedding images (optimized with pause on hover)
    const [isWeddingHovered, setIsWeddingHovered] = useState(false);
    const activeWeddings = useMemo(() => planWeddings.filter(w => w.is_active), [planWeddings]);
    useEffect(() => {
        if (activeWeddings.length > 1 && !isWeddingHovered) {
            const interval = setInterval(() => {
                setCurrentWeddingIndex((prev) => (prev + 1) % activeWeddings.length);
            }, 10000); // Change image every 10 seconds
            return () => clearInterval(interval);
        } else if (activeWeddings.length === 1) {
            setCurrentWeddingIndex(0); // Ensure first wedding is shown
        }
    }, [activeWeddings.length, isWeddingHovered]);

    const toggleChat = () => setIsChatOpen(!isChatOpen);

    // Handlers for opening booking modals
    const handleOpenRoomBookingForm = (roomId) => {
        setBookingData(prev => ({ ...prev, room_ids: prev.room_ids.includes(roomId) ? prev.room_ids : [...prev.room_ids, roomId] }));
        setIsRoomBookingFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    // Lazy reveal on scroll for elements with .reveal - optimized for performance
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            // Use requestAnimationFrame for smoother updates
            requestAnimationFrame(() => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in');
                        observer.unobserve(entry.target);
                    }
                });
            });
        }, { 
            threshold: 0.1, 
            rootMargin: '50px' // Reduced from 100px for better performance
        });

        const nodes = document.querySelectorAll('.reveal');
        nodes.forEach((n) => observer.observe(n));
        return () => observer.disconnect();
    }, [galleryImages, packages]);

    const handleOpenPackageBookingForm = (packageId) => {
        // Always prioritize dates from bookingData (selected on previous page) over packageBookingData
        setPackageBookingData(prev => {
            const checkIn = (bookingData.check_in && bookingData.check_in.trim() !== '') 
                ? bookingData.check_in 
                : (prev.check_in && prev.check_in.trim() !== '' ? prev.check_in : '');
            const checkOut = (bookingData.check_out && bookingData.check_out.trim() !== '') 
                ? bookingData.check_out 
                : (prev.check_out && prev.check_out.trim() !== '' ? prev.check_out : '');
            
            return {
                ...prev, 
                package_id: packageId,
                check_in: checkIn,
                check_out: checkOut
            };
        });
        setIsPackageBookingFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    const handleOpenServiceBookingForm = (serviceId) => {
        setServiceBookingData({ ...serviceBookingData, service_id: serviceId });
        setIsServiceBookingFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    const handleOpenFoodOrderForm = () => {
        setIsFoodOrderFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    // Handlers for form changes
    const handleRoomBookingChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => {
            const updated = { ...prev, [name]: value };
            // If check_in is changed and is after check_out, clear check_out
            if (name === 'check_in' && value && prev.check_out && value >= prev.check_out) {
                updated.check_out = '';
            }
            // If check_out is changed and is before check_in, clear check_in
            if (name === 'check_out' && value && prev.check_in && value <= prev.check_in) {
                updated.check_in = '';
            }
            return updated;
        });
    };

    const handleRoomSelection = useCallback((roomId) => {
        setBookingData(prev => {
            const newRoomIds = prev.room_ids.includes(roomId)
                ? prev.room_ids.filter(id => id !== roomId)
                : [...prev.room_ids, roomId];
            return { ...prev, room_ids: newRoomIds };
        });
    }, []);

    const handlePackageBookingChange = (e) => {
        const { name, value } = e.target;
        setPackageBookingData(prev => {
            const updated = { ...prev, [name]: value };
            // If check_in is changed and is after check_out, clear check_out
            if (name === 'check_in' && value && prev.check_out && value >= prev.check_out) {
                updated.check_out = '';
            }
            // If check_out is changed and is before check_in, clear check_in
            if (name === 'check_out' && value && prev.check_in && value <= prev.check_in) {
                updated.check_in = '';
            }
            return updated;
        });
    };

    const handleServiceBookingChange = (e) => {
        const { name, value } = e.target;
        setServiceBookingData(prev => ({ ...prev, [name]: value }));
    };

    const handlePackageRoomSelection = useCallback((roomId) => {
        setPackageBookingData(prev => {
            const newRoomIds = prev.room_ids.includes(roomId)
                ? prev.room_ids.filter(id => id !== roomId)
                : [...prev.room_ids, roomId];
            return { ...prev, room_ids: newRoomIds };
        });
    }, []);

    const handleFoodOrderChange = (e, foodItemId) => {
        const { value } = e.target;
        setFoodOrderData(prev => ({
            ...prev,
            items: {
                ...prev.items,
                [foodItemId]: parseInt(value) || 0,
            }
        }));
    };

    // Check room availability based on selected dates (but always show all rooms)
    const [roomAvailability, setRoomAvailability] = useState({});
    
    // Optimized room availability calculation with useMemo and debouncing
    const roomAvailabilityMemo = useMemo(() => {
        if (!bookingData.check_in || !bookingData.check_out || allRooms.length === 0) {
            return {};
        }
        
        // Calculate availability for each room (memoized for performance)
        const availability = {};
        allRooms.forEach(room => {
            const hasConflict = bookings.some(booking => {
                const normalizedStatus = booking.status?.toLowerCase().replace(/_/g, '-');
                if (normalizedStatus === "cancelled" || normalizedStatus === "checked-out") return false;
                
                const bookingCheckIn = new Date(booking.check_in);
                const bookingCheckOut = new Date(booking.check_out);
                const requestedCheckIn = new Date(bookingData.check_in);
                const requestedCheckOut = new Date(bookingData.check_out);
                
                const isRoomInBooking = booking.rooms && booking.rooms.some(r => r.id === room.id);
                if (!isRoomInBooking) return false;
                
                return (requestedCheckIn < bookingCheckOut && requestedCheckOut > bookingCheckIn);
            });
            
            availability[room.id] = !hasConflict;
        });
        return availability;
    }, [bookingData.check_in, bookingData.check_out, allRooms, bookings]);
    
    // Update state with debouncing to prevent excessive re-renders
    useEffect(() => {
        const timer = setTimeout(() => {
            setRoomAvailability(roomAvailabilityMemo);
        }, 100); // 100ms debounce
        return () => clearTimeout(timer);
    }, [roomAvailabilityMemo]);
    
    // Always set rooms to allRooms - availability filtering happens in UI
    useEffect(() => {
        setRooms(allRooms);
    }, [allRooms]);

    // Package booking availability - optimized with useMemo
    const [packageRoomAvailability, setPackageRoomAvailability] = useState({});
    
    const packageRoomAvailabilityMemo = useMemo(() => {
        if (!packageBookingData.check_in || !packageBookingData.check_out || allRooms.length === 0 || !isPackageBookingFormOpen) {
            return {};
        }
        
        // Calculate availability for each room for package booking (memoized for performance)
        const availability = {};
        allRooms.forEach(room => {
            const hasConflict = bookings.some(booking => {
                const normalizedStatus = booking.status?.toLowerCase().replace(/_/g, '-');
                if (normalizedStatus === "cancelled" || normalizedStatus === "checked-out") return false;
                
                const bookingCheckIn = new Date(booking.check_in);
                const bookingCheckOut = new Date(booking.check_out);
                const requestedCheckIn = new Date(packageBookingData.check_in);
                const requestedCheckOut = new Date(packageBookingData.check_out);
                
                const isRoomInBooking = booking.rooms && booking.rooms.some(r => r.id === room.id);
                if (!isRoomInBooking) return false;
                
                return (requestedCheckIn < bookingCheckOut && requestedCheckOut > bookingCheckIn);
            });
            
            availability[room.id] = !hasConflict;
        });
        return availability;
    }, [packageBookingData.check_in, packageBookingData.check_out, allRooms, bookings, isPackageBookingFormOpen]);
    
    // Update state with debouncing to prevent excessive re-renders
    useEffect(() => {
        const timer = setTimeout(() => {
            setPackageRoomAvailability(packageRoomAvailabilityMemo);
        }, 100); // 100ms debounce
        return () => clearTimeout(timer);
    }, [packageRoomAvailabilityMemo]);

    // Handlers for form submissions
    const handleRoomBookingSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isBookingLoading) {
            return;
        }
        
        setIsBookingLoading(true);
        setBookingMessage({ type: null, text: "" });

        if (bookingData.room_ids.length === 0) {
            showBannerMessage("error", "Please select at least one room before booking.");
            setIsBookingLoading(false);
            return;
        }

        // --- MINIMUM BOOKING DURATION VALIDATION ---
        if (bookingData.check_in && bookingData.check_out) {
            const checkInDate = new Date(bookingData.check_in);
            const checkOutDate = new Date(bookingData.check_out);
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);
            
            if (daysDiff < 1) {
                showBannerMessage("error", "Minimum 1 day booking is mandatory. Check-out date must be at least 1 day after check-in date.");
                setIsBookingLoading(false);
                return;
            }
        }

        // --- CAPACITY VALIDATION ---
        const totalGuests = parseInt(bookingData.adults) + parseInt(bookingData.children);
        const selectedRoomDetails = bookingData.room_ids.map(roomId => rooms.find(r => r.id === roomId)).filter(Boolean);
        const totalCapacity = selectedRoomDetails.reduce((sum, room) => sum + (room.adults || 0) + (room.children || 0), 0);

        if (totalGuests > totalCapacity) {
            showBannerMessage("error", `Guest count (${totalGuests}) exceeds the total capacity (${totalCapacity}) of the selected rooms.`);
            setIsBookingLoading(false);
            return;
        }
        // -------------------------

        try {
            const API_BASE_URL = getApiBaseUrl();
            const response = await fetch(`${API_BASE_URL}/bookings/guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                showBannerMessage("success", "Room booking successful! We look forward to your stay.");
                setBookingData({ room_ids: [], guest_name: "", guest_mobile: "", guest_email: "", check_in: "", check_out: "", adults: 1, children: 0 });
                // Close the booking form after successful booking
                setTimeout(() => {
                    setIsRoomBookingFormOpen(false);
                }, 2000);
            } else {
                const errorData = await response.json();
                // Check if it's a validation error from the backend
                if (errorData.detail && errorData.detail.includes("Check-out date must be at least 1 day")) {
                    showBannerMessage("error", "Minimum 1 day booking is mandatory. Check-out date must be at least 1 day after check-in date.");
                } else {
                    showBannerMessage("error", `Booking failed: ${errorData.detail || "An unexpected error occurred."}`);
                }
            }
        } catch (err) {
            console.error("Booking API Error:", err);
            showBannerMessage("error", "An error occurred while booking. Please try again.");
        } finally {
            setIsBookingLoading(false);
        }
    };

    const handlePackageBookingSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isBookingLoading) {
            return;
        }
        
        setIsBookingLoading(true);
        setBookingMessage({ type: null, text: "" });

        if (packageBookingData.room_ids.length === 0) {
            showBannerMessage("error", "Please select at least one room for the package.");
            setIsBookingLoading(false);
            return;
        }

        // --- MINIMUM BOOKING DURATION VALIDATION ---
        if (packageBookingData.check_in && packageBookingData.check_out) {
            const checkInDate = new Date(packageBookingData.check_in);
            const checkOutDate = new Date(packageBookingData.check_out);
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);
            
            if (daysDiff < 1) {
                showBannerMessage("error", "Minimum 1 day booking is mandatory. Check-out date must be at least 1 day after check-in date.");
                setIsBookingLoading(false);
                return;
            }
        }

        // --- CAPACITY VALIDATION ---
        const totalGuests = parseInt(packageBookingData.adults) + parseInt(packageBookingData.children);
        const selectedRoomDetails = packageBookingData.room_ids.map(roomId => rooms.find(r => r.id === roomId)).filter(Boolean);
        const totalCapacity = selectedRoomDetails.reduce((sum, room) => sum + (room.adults || 0) + (room.children || 0), 0);

        if (totalGuests > totalCapacity) {
            showBannerMessage("error", `Guest count (${totalGuests}) exceeds the total capacity (${totalCapacity}) of the selected rooms for this package.`);
            setIsBookingLoading(false);
            return;
        }
        // -------------------------

        try {
            const API_BASE_URL = getApiBaseUrl();
            
            // Validate required fields
            if (!packageBookingData.package_id) {
                showBannerMessage("error", "Package ID is missing. Please select a package.");
                setIsBookingLoading(false);
                return;
            }
            
            if (!packageBookingData.check_in || !packageBookingData.check_out) {
                showBannerMessage("error", "Please select check-in and check-out dates.");
                setIsBookingLoading(false);
                return;
            }
            
            if (!packageBookingData.guest_name) {
                showBannerMessage("error", "Please enter your full name.");
                setIsBookingLoading(false);
                return;
            }
            
            // Email and mobile are optional in the schema, but we'll recommend at least one
            if (!packageBookingData.guest_email && !packageBookingData.guest_mobile) {
                showBannerMessage("error", "Please provide at least an email address or mobile number.");
                setIsBookingLoading(false);
                return;
            }
            
            const payload = {
                package_id: parseInt(packageBookingData.package_id),
                room_ids: packageBookingData.room_ids.map(id => parseInt(id)),
                guest_name: packageBookingData.guest_name.trim(),
                guest_email: packageBookingData.guest_email?.trim() || null,
                guest_mobile: packageBookingData.guest_mobile.trim(),
                check_in: packageBookingData.check_in,
                check_out: packageBookingData.check_out,
                adults: parseInt(packageBookingData.adults) || 1,
                children: parseInt(packageBookingData.children) || 0,
            };
            
            console.log("Package Booking Payload:", payload); // Debug log
            
            const response = await fetch(`${API_BASE_URL}/packages/book/guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showBannerMessage("success", "Package booking successful! We look forward to your stay.");
                setPackageBookingData({ package_id: null, room_ids: [], guest_name: "", guest_mobile: "", guest_email: "", check_in: "", check_out: "", adults: 1, children: 0 });
                // Close the booking form after successful booking
                setTimeout(() => {
                    setIsPackageBookingFormOpen(false);
                }, 2000);
            } else {
                let errorMessage = "An unexpected error occurred.";
                try {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                        console.error("Package Booking Error Response:", errorData);
                        
                // Check if it's a validation error from the backend
                        if (errorData.detail) {
                            if (typeof errorData.detail === 'string') {
                                errorMessage = errorData.detail;
                            } else if (Array.isArray(errorData.detail)) {
                                // Handle Pydantic validation errors
                                const errors = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
                                errorMessage = `Validation error: ${errors}`;
                } else {
                                errorMessage = JSON.stringify(errorData.detail);
                            }
                        }
                    } else {
                        const textError = await response.text();
                        console.error("Error response text:", textError);
                        errorMessage = textError || `Server error (${response.status}): ${response.statusText}`;
                    }
                } catch (parseError) {
                    console.error("Failed to parse error response:", parseError);
                    errorMessage = `Server error (${response.status}): ${response.statusText}`;
                }
                showBannerMessage("error", `Package booking failed: ${errorMessage}`);
            }
        } catch (err) {
            console.error("Package Booking API Error:", err);
            showBannerMessage("error", `An error occurred while booking the package: ${err.message || "Please check your connection and try again."}`);
        } finally {
            setIsBookingLoading(false);
        }
    };
    
    const handleServiceBookingSubmit = async (e) => {
        e.preventDefault();
        setIsBookingLoading(true);
        setBookingMessage({ type: null, text: "" });

        try {
            const API_BASE_URL = getApiBaseUrl();
            const response = await fetch(`${API_BASE_URL}/services/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceBookingData)
            });

            if (response.ok) {
                showBannerMessage("success", "Service booking successful! Our staff will be with you shortly.");
                setServiceBookingData({ service_id: null, guest_name: "", guest_mobile: "", guest_email: "", room_id: null });
                // Close the booking form after successful booking
                setTimeout(() => {
                    setIsServiceBookingFormOpen(false);
                }, 2000);
            } else {
                const errorData = await response.json();
                showBannerMessage("error", `Service booking failed: ${errorData.detail || "An unexpected error occurred."}`);
            }
        } catch (err) {
            console.error("Service Booking API Error:", err);
            showBannerMessage("error", "An error occurred while booking the service. Please try again.");
        } finally {
            setIsBookingLoading(false);
        }
    };

    const handleFoodOrderSubmit = async (e) => {
        e.preventDefault();
        setIsBookingLoading(true);
        setBookingMessage({ type: null, text: "" });

        const itemsPayload = Object.entries(foodOrderData.items)
                                .filter(([, quantity]) => quantity > 0)
                                .map(([food_item_id, quantity]) => ({ food_item_id: parseInt(food_item_id), quantity }));
        
        if (itemsPayload.length === 0) {
            showBannerMessage("error", "Please select at least one food item.");
            setIsBookingLoading(false);
            return;
        }

        const payload = {
            room_id: foodOrderData.room_id,
            items: itemsPayload,
            amount: 0, // Amount will be calculated by the backend
            assigned_employee_id: 0,
            billing_status: "unbilled"
        };
        
        try {
            const API_BASE_URL = getApiBaseUrl();
            const response = await fetch(`${API_BASE_URL}/food-orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showBannerMessage("success", "Food order placed successfully! Your meal will be delivered shortly.");
                setFoodOrderData({ room_id: null, items: {} });
                // Close the booking form after successful order
                setTimeout(() => {
                    setIsFoodOrderFormOpen(false);
                }, 2000);
            } else {
                const errorData = await response.json();
                showBannerMessage("error", `Food order failed: ${errorData.detail || "An unexpected error occurred."}`);
            }
        } catch (err) {
            console.error("Food Order API Error:", err);
            showBannerMessage("error", "An error occurred while placing the food order. Please try again.");
        } finally {
            setIsBookingLoading(false);
        }
    };
    
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userMessage.trim() || isChatLoading) return;

        const newUserMessage = { role: "user", parts: [{ text: userMessage }] };
        setChatHistory(prev => [...prev, newUserMessage]);
        setUserMessage("");
        setIsChatLoading(true);

        try {
            // Replace with your actual Gemini API key
            const apiKey = "YOUR_GEMINI_API_KEY";
            if (apiKey === "YOUR_GEMINI_API_KEY") {
                 setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "Please replace 'YOUR_GEMINI_API_KEY' with your actual API key in App.js." }] }]);
                 setIsChatLoading(false);
                 return;
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const payload = { contents: [...chatHistory, newUserMessage] };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API call failed: ${response.status}`);

            const result = await response.json();
            const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (botResponse) {
                setChatHistory(prev => [...prev, { role: "model", parts: [{ text: botResponse }] }]);
            } else {
                setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "I'm sorry, I couldn't generate a response." }] }]);
            }
        } catch (err) {
            console.error("Gemini API Error:", err);
            setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "I'm having trouble connecting. Please check your API key and network." }] }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        // Apply theme to document body for better visibility
        document.documentElement.className = '';
        document.body.className = `${theme.bgPrimary} ${theme.textPrimary} transition-colors duration-500`;
    }, [theme]);


    // Debounced scroll handler for better performance
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setShowBackToTop(window.scrollY > 300);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const sectionTitleStyle = `text-3xl md:text-5xl font-extrabold mb-8 text-center tracking-tight bg-gradient-to-r ${theme.textTitleGradient} text-transparent bg-clip-text`;
    const cardStyle = `flex-none w-80 md:w-96 ${theme.bgCard} rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out border ${theme.border} ${theme.borderHover} transform group-hover:-translate-y-1 group-hover:shadow-lg`;
    const iconStyle = `w-6 h-6 ${theme.textAccent} transition-transform duration-300 group-hover:rotate-12`;
    const textPrimary = theme.textPrimary;
    const textSecondary = theme.textSecondary;
    const priceStyle = `font-bold text-xl ${theme.textAccent} tracking-wider`;
    const buttonStyle = `mt-4 inline-flex items-center text-sm font-semibold ${theme.textAccent} hover:text-white transition duration-300`;

    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${theme.bgPrimary} ${theme.textPrimary}`}>
                <div className="flex flex-col items-center">
                    <svg className={`animate-spin h-10 w-10 ${theme.textAccent}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4">Loading resort data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${theme.bgPrimary} text-red-400`}>
                <p className={`p-4 ${theme.bgCard} rounded-lg shadow-lg`}>{error}</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
              @keyframes auto-scroll-bobbing { 0% { transform: translate(0, 0); } 25% { transform: translate(-12.5%, 3px); } 50% { transform: translate(-25%, 0); } 75% { transform: translate(-37.5%, -3px); } 100% { transform: translate(-50%, 0); } }
              @keyframes auto-scroll-bobbing-reverse { 0% { transform: translate(-50%, 0); } 25% { transform: translate(-37.5%, 3px); } 50% { transform: translate(-25%, 0); } 75% { transform: translate(-12.5%, -3px); } 100% { transform: translate(0, 0); } }
              @keyframes auto-scroll-reverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
              @keyframes auto-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
              .horizontal-scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
              .horizontal-scroll-container::-webkit-scrollbar { display: none; }
              @keyframes bounce-dot { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
              .animate-bounce-dot > div { animation: bounce-dot 1.4s infinite ease-in-out both; }
            `}</style>

            <div className={`relative ${theme.bgPrimary} ${theme.textPrimary} font-sans min-h-screen transition-colors duration-500`}>
                <BackgroundAnimation theme={theme} />
                
                {/* Banner Message - High z-index to appear above all modals and overlays */}
                {bannerMessage.text && (
                    <div 
                        className={`fixed top-0 left-0 right-0 z-[99999] p-4 text-white text-center font-medium shadow-2xl transform transition-all duration-300 ${
                            bannerMessage.type === 'success' ? 'bg-green-600' : 
                            bannerMessage.type === 'error' ? 'bg-red-600' : 
                            bannerMessage.type === 'warning' ? 'bg-yellow-600' : 
                            'bg-blue-600'
                        }`}
                        style={{ 
                            zIndex: 99999,
                            pointerEvents: 'auto'
                        }}
                    >
                        <div className="flex items-center justify-center relative max-w-7xl mx-auto">
                            <span className="mr-2">
                                {bannerMessage.type === 'success' ? '✅' : 
                                 bannerMessage.type === 'error' ? '❌' : 
                                 bannerMessage.type === 'warning' ? '⚠️' : 
                                 'ℹ️'}
                            </span>
                            <span className="flex-1">{bannerMessage.text}</span>
                            <button 
                                onClick={() => setBannerMessage({ type: null, text: "" })}
                                className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                                aria-label="Close message"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
                
                <header className={`fixed left-0 right-0 z-50 ${theme.bgCard}/30 backdrop-blur-sm shadow-sm ${bannerMessage.text ? 'top-16' : 'top-0'} transition-all duration-300`}>
                    <div className="container mx-auto px-4 sm:px-6 md:px-12 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <BedDouble className={`w-8 h-8 ${theme.textAccent}`} />
                            <span className={`text-2xl font-bold ${theme.textPrimary} tracking-tight`}>Elysian Retreat</span>
                        </div>
                        <nav className="flex items-center space-x-4">
                            <button 
                                onClick={() => setIsGeneralBookingOpen(true)} 
                                className={`px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 transform hover:scale-105`}
                            >
                                Book Now
                            </button>
                        </nav>
                    </div>
                </header>

                <main className="w-full max-w-full pt-0 space-y-0 relative z-10 overflow-hidden">
                  {/* Luxury Hero Banner Section */}
<div
  ref={bannerRef}
  className="relative w-full h-screen overflow-hidden"
>
    {bannerData.length > 0 ? (
        <>
            {/* Banner Images with Fade Transition and Slow Movement */}
            {bannerData.map((banner, index) => (
                <img
                    key={banner.id}
                    src={getImageUrl(banner.image_url)}
                    onError={(e) => { e.target.src = ITEM_PLACEHOLDER; console.error('Banner image failed to load:', banner.image_url); }}
                    alt={banner.title}
                    className={`absolute inset-0 w-[110%] h-[110%] object-cover object-center transition-all duration-[10000ms] ease-in-out ${index === currentBannerIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} animate-[slow-pan_20s_ease-in-out_infinite]`}
                    style={{
                        animationDelay: `${index * 2}s`,
                        animationDirection: index % 2 === 0 ? 'alternate' : 'alternate-reverse'
                    }}
                />
            ))}

            {/* Luxury Gradient Overlay with Premium Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 flex items-center justify-center text-center px-6">
                <div className="relative w-full max-w-5xl">
                    {bannerData.map((banner, index) => (
                        <div key={banner.id} className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${index === currentBannerIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <div className="mb-4 inline-block px-6 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full border border-amber-400/30 animate-[fadeInUp_1s_ease-out]">
                                <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">
                                    ✦ Luxury Experience ✦
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight drop-shadow-2xl text-white mb-6 animate-[fadeInUp_1.2s_ease-out]">
                                <span className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent inline-block animate-[gentle-glow_3s_ease-in-out_infinite]">
                                    {banner.title}
                                </span>
                            </h1>
                            <p className="mt-4 text-xl md:text-2xl text-neutral-100 max-w-4xl mx-auto leading-relaxed drop-shadow-lg px-4 animate-[fadeInUp_1.4s_ease-out]">
                                {banner.subtitle}
                            </p>
                            <div className="mt-10 flex flex-wrap justify-center gap-4 animate-[fadeInUp_1.6s_ease-out]">
                                <a href="#rooms-section" className="group px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg rounded-full shadow-2xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 transform hover:scale-110 hover:shadow-amber-500/50 animate-[gentle-pulse_2s_ease-in-out_infinite]">
                                    <span className="flex items-center gap-2">
                                        Book Your Stay
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </a>
                                <a href="#packages" className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-full border-2 border-white/30 hover:bg-white/20 transition-all duration-300">
                                    View Packages
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Luxury Navigation Dots - Only show if multiple banners */}
            {bannerData.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                {bannerData.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentBannerIndex(index)}
                        className={`transition-all duration-300 ${
                            index === currentBannerIndex
                                ? "w-12 h-1 bg-amber-400 rounded-full"
                                : "w-8 h-1 bg-white/40 hover:bg-white/60 rounded-full"
                        }`}
                    />
                ))}
            </div>
            )}
        </>
    ) : (
        <div className={`w-full h-full flex items-center justify-center ${theme.placeholderBg} ${theme.placeholderText}`}>
            No banner images available.
        </div>
    )}
</div>

                    {/* Exclusive Deals Section - Mountain Shadows Style */}
                    <section id="packages" className={`bg-gradient-to-b ${theme.bgSecondary} ${theme.bgCard} py-20 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className={`inline-block px-6 py-2 bg-amber-500/10 ${theme.textAccent} text-sm font-semibold tracking-widest uppercase rounded-full mb-4`}>
                                    ✦ Exclusive Deals ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    EXCLUSIVE DEALS FOR MEMORABLE EXPERIENCES
                                </h2>
                            </div>

                            {/* Packages - Mountain Shadows Style */}
                            {packages.length > 0 ? (
                                <div className="space-y-12">
                                    {/* Featured Large Package */}
                                    {packages[0] && (() => {
                                        const featuredPkg = packages[0];
                                        const imgIndex = packageImageIndex[featuredPkg.id] || 0;
                                        const currentImage = featuredPkg.images && featuredPkg.images[imgIndex];
                                        return (
                                            <div 
                                                key={featuredPkg.id}
                                                className={`${theme.bgCard} rounded-3xl overflow-hidden shadow-2xl border ${theme.border} transition-all duration-500 hover:shadow-3xl reveal`}
                                                style={{ transitionDelay: '80ms' }}
                                            >
                                                <div className="flex flex-col md:flex-row items-stretch">
                                                    {/* Large Image Section - Left */}
                                                    <div className="w-full md:w-1/2 h-80 md:h-[500px] overflow-hidden relative">
                                                    <img 
                                                            src={currentImage ? getImageUrl(currentImage.image_url) : ITEM_PLACEHOLDER} 
                                                            alt={featuredPkg.title} 
                                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 reveal" 
                                                            loading="lazy"
                                                            onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                        />
                                                        {/* Price badge - large card */}
                                                        <div className="absolute bottom-4 left-4 bg-white/95 text-amber-700 font-extrabold text-2xl md:text-3xl px-4 py-2 rounded-xl shadow-lg">
                                                            {formatCurrency(featuredPkg.price || 0)}
                                                        </div>
                                                        {/* Image Slider Dots */}
                                                        {featuredPkg.images && featuredPkg.images.length > 1 && (
                                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full z-10">
                                                                {featuredPkg.images.map((_, imgIdx) => (
                                                                    <button
                                                                        key={imgIdx}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setPackageImageIndex(prev => ({ ...prev, [featuredPkg.id]: imgIdx }));
                                                                        }}
                                                                        className={`w-2 h-2 rounded-full transition-all ${imgIdx === imgIndex ? 'bg-white' : 'bg-white/40'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Content Section - Right */}
                                                    <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center ${theme.bgCard}`}>
                                                        <h3 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-2 leading-tight`}>
                                                            {featuredPkg.title}
                                                        </h3>
                                                        <p className={`text-xl md:text-2xl ${theme.textSecondary} mb-6 font-medium`}>
                                                            (Luxury Package {featuredPkg.duration || '2 Nights & 3 Days'})
                                                        </p>
                                                        <div className="w-20 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mb-6"></div>
                                                        <p className={`text-base md:text-lg ${theme.textSecondary} leading-relaxed mb-6`}>
                                                            {featuredPkg.description}
                                                        </p>
                                                        {/* Price Section */}
                                                        <div className="mb-6 pt-4 border-t border-gray-200">
                                                            <p className={`text-sm ${theme.textSecondary} mb-2`}>Starting from</p>
                                                            <p className={`text-3xl md:text-4xl font-extrabold ${theme.textAccent} mb-6`}>
                                                                {formatCurrency(featuredPkg.price || 0)}
                                                                <span className={`text-lg ${theme.textSecondary} font-normal ml-2`}>/package</span>
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                                            <button
                                                                onClick={() => handleOpenPackageBookingForm(featuredPkg.id)} 
                                                                className={`px-8 py-3 border-2 ${theme.border} ${theme.textAccent} font-bold rounded-full hover:${theme.bgSecondary} transition-all duration-300 transform hover:scale-105 flex items-center gap-2`}
                                                            >
                                                                Book Now
                                                                <ChevronRight className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Smaller Packages Grid - Only show if more than 1 package */}
                                    {packages.length > 1 && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {packages.slice(1).map((pkg) => {
                                        const imgIndex = packageImageIndex[pkg.id] || 0;
                                        const currentImage = pkg.images && pkg.images[imgIndex];
                                        return (
                                            <div 
                                                key={pkg.id} 
                                                onClick={() => handleOpenPackageBookingForm(pkg.id)}
                                                className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border ${theme.border} cursor-pointer reveal`}
                                                style={{ transitionDelay: `${(imgIndex % 5) * 70}ms` }}
                                            >
                                                        {/* Image Container */}
                                                    <div className="relative h-64 overflow-hidden">
                                                    <img 
                                                                src={currentImage ? getImageUrl(currentImage.image_url) : ITEM_PLACEHOLDER} 
                                                        alt={pkg.title} 
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 reveal" 
                                                        loading="lazy"
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                    />
                                                    {/* Price badge - always visible */}
                                                    <div className="absolute bottom-3 left-3 bg-white/90 text-amber-700 font-extrabold text-lg px-3 py-1 rounded-lg shadow-md">
                                                        {formatCurrency(pkg.price || 0)}
                                                    </div>
                                                            {/* Quick Book button overlay */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); handleOpenPackageBookingForm(pkg.id); }}
                                                                className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md hover:bg-amber-600"
                                                            >
                                                                Book Now
                                                            </button>
                                                    {/* Image Slider Dots */}
                                                    {pkg.images && pkg.images.length > 1 && (
                                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full z-10">
                                                            {pkg.images.map((_, imgIdx) => (
                                                                <button
                                                                    key={imgIdx}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setPackageImageIndex(prev => ({ ...prev, [pkg.id]: imgIdx }));
                                                                    }}
                                                                    className={`w-2 h-2 rounded-full transition-all ${imgIdx === imgIndex ? 'bg-white' : 'bg-white/40'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                        </div>

                                                        {/* Content - Simplified like Mountain Shadows */}
                                                        <div className={`p-6 ${theme.bgCard}`}>
                                                            <h3 className={`text-xl md:text-2xl font-extrabold ${theme.textPrimary} mb-2 leading-tight`}>
                                                            {pkg.title}
                                                        </h3>
                                                            <p className={`text-base ${theme.textSecondary} font-medium mb-2`}>
                                                                (Luxury Package {pkg.duration || '2 Nights & 3 Days'})
                                                            </p>
                                                            {/* Price */}
                                                            <div className="mb-4 pt-3 border-t border-gray-200">
                                                                <p className={`text-sm ${theme.textSecondary} mb-1`}>Starting from</p>
                                                                <p className={`text-2xl font-extrabold ${theme.textAccent || theme.textPrimary}`}>
                                                                    {formatCurrency(pkg.price || 0)}
                                                                    <span className={`text-sm ${theme.textSecondary} font-normal`}>/package</span>
                                                                </p>
                                                            </div>
                                                            {/* CTA Row */}
                                                            <div className="mt-4 flex items-center justify-between">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleOpenPackageBookingForm(pkg.id); }}
                                                                    className={`px-5 py-2 rounded-full border-2 ${theme.border} ${theme.textAccent} font-semibold hover:${theme.bgSecondary} transition-all duration-300`}
                                                                >
                                                                    Book Now
                                                                </button>
                                                                <span className={`text-sm ${theme.textSecondary}`}>
                                                                    Tap card to book
                                                                </span>
                                                            </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className={`text-center py-12 ${theme.textSecondary}`}>No packages available at the moment.</p>
                            )}
                        </div>
                    </section>
                    
                    {/* Luxury Villa Showcase Section */}
                    <section id="rooms-section" className={`bg-gradient-to-b ${theme.bgCard} ${theme.bgSecondary} py-20 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-amber-500/10 text-amber-600 text-sm font-semibold tracking-widest uppercase rounded-full mb-4">
                                    ✦ LUXURY ACCOMMODATION ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    Sustainable Luxury Cottages with Unforgettable Views
                                </h2>
                                <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
                                    Experience the perfect blend of luxury and sustainability in our eco-friendly cottages with panoramic lake and forest views
                                </p>
                            </div>

                            {/* Info Banner - Show when dates not selected */}
                            {(!bookingData.check_in || !bookingData.check_out) && (
                                <div className="mb-8">
                                    <div className={`inline-block w-full p-4 ${theme.bgSecondary} rounded-xl border ${theme.border} shadow-sm`}>
                                        <div className="flex items-center gap-3 justify-center flex-wrap">
                                            <BedDouble className={`w-5 h-5 ${theme.textAccent}`} />
                                            <p className={`text-sm ${theme.textSecondary}`}>
                                                Select check-in and check-out dates above to check room availability for your stay
                                            </p>
                                            <button 
                                                onClick={() => setIsGeneralBookingOpen(true)}
                                                className={`px-4 py-2 text-xs font-semibold ${theme.buttonBg} ${theme.buttonText} rounded-full shadow hover:shadow-md transition-all duration-300 transform hover:scale-105`}
                                            >
                                                Select Dates
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Availability Info - Show when dates are selected */}
                            {bookingData.check_in && bookingData.check_out && Object.keys(roomAvailability).length > 0 && (
                                <div className="mb-6">
                                    <div className={`inline-block w-full p-3 ${theme.bgCard} rounded-lg border ${theme.border} shadow-sm`}>
                                        <p className={`text-sm ${theme.textPrimary} text-center`}>
                                            Showing availability for <span className="font-semibold">{bookingData.check_in}</span> to <span className="font-semibold">{bookingData.check_out}</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Villa Grid - Always show ALL rooms */}
                            {rooms.length > 0 ? (
                                <>
                                    <div className="mb-4 text-center">
                                        <p className={`text-sm ${theme.textSecondary}`}>
                                            Showing all <span className="font-semibold ${theme.textPrimary}">{rooms.length}</span> rooms
                                        </p>
                                    </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {rooms.map((room, index) => (
                                        <div 
                                            key={room.id} 
                                            className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden luxury-shadow transition-all duration-300 transition-all duration-500 transform hover:-translate-y-2 border ${theme.cardBorder || theme.border}`}
                                        >
                                            {/* Image Container with Overlay */}
                                            <div className="relative h-48 overflow-hidden">
                                                <img 
                                                    src={getImageUrl(room.image_url)} 
                                                    alt={room.type} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                    onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                                
                                                {/* Luxury Badge */}
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-4 py-2 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                                        Premium Villa
                                                    </span>
                                                </div>

                                                {/* Availability Badge - Only show when dates are selected */}
                                                {bookingData.check_in && bookingData.check_out && (
                                                <div className="absolute top-4 right-4">
                                                        {roomAvailability[room.id] ? (
                                                            <span className="px-4 py-2 rounded-full text-xs font-bold shadow-lg bg-green-500 text-white">
                                                                Available
                                                    </span>
                                                        ) : (
                                                            <span className="px-4 py-2 rounded-full text-xs font-bold shadow-lg bg-red-500 text-white">
                                                                Booked
                                                            </span>
                                                        )}
                                                </div>
                                                )}

                                                {/* Hover Effect Overlay */}
                                                <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-all duration-500" />
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 space-y-4">
                                                <h3 className={`text-2xl font-bold ${theme.textCardPrimary || theme.textPrimary} group-hover:${theme.textCardAccent || theme.textAccent} transition-colors`}>
                                                    {room.type}
                                                </h3>
                                                <div className={`flex items-center gap-2 text-sm ${theme.textCardSecondary || theme.textSecondary}`}>
                                                    <BedDouble className={`w-5 h-5 ${theme.textCardAccent || theme.textAccent}`} />
                                                    <span>Room #{room.number}</span>
                                                </div>
                                                
                                                {/* Features */}
                                                <div className={`flex items-center gap-4 text-sm ${theme.textCardSecondary || theme.textSecondary}`}>
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                                        Lake View
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                                        Balcony
                                                    </span>
                                                </div>

                                                {/* Price */}
                                                <div className={`flex items-baseline justify-between pt-2 border-t ${theme.cardBorder || theme.border}`}>
                                                    <div>
                                                        <p className={`text-sm ${theme.textCardSecondary || theme.textSecondary}`}>Starting from</p>
                                                        <p className={`text-3xl font-extrabold ${theme.textCardAccent || theme.textAccent}`}>
                                                            {formatCurrency(room.price)}
                                                            <span className={`text-sm ${theme.textCardSecondary || theme.textSecondary} font-normal`}>/night</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* CTA Button */}
                                                <button 
                                                    onClick={() => handleOpenRoomBookingForm(room.id)} 
                                                    disabled={bookingData.check_in && bookingData.check_out && !roomAvailability[room.id]}
                                                    className={`w-full mt-4 px-6 py-3 font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
                                                        bookingData.check_in && bookingData.check_out && !roomAvailability[room.id]
                                                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-50'
                                                            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/50'
                                                    }`}
                                                >
                                                    {bookingData.check_in && bookingData.check_out && !roomAvailability[room.id] ? 'Not Available' : 'Book Now'}
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <BedDouble className={`w-16 h-16 ${theme.textSecondary} mx-auto mb-4`} />
                                    <p className={`text-lg font-semibold ${theme.textPrimary} mb-2`}>No rooms available</p>
                                    <p className={`${theme.textSecondary}`}>No rooms found in the system.</p>
                                </div>
                            )}

                        </div>
                    </section>

                    {/* Premium Experiences Section - Mountain Shadows Style */}
                    <section className={`${theme.bgCard} py-20 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-amber-500/10 text-amber-600 text-sm font-semibold tracking-widest uppercase rounded-full mb-4">
                                    ✦ Signature Experiences ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    SIGNATURE EXPERIENCES AT THE BEST LUXURY RESORT
                                </h2>
                                <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
                                    Guests can enjoy a range of curated in-house activities designed to explore the region's rich flora and fauna
                                </p>
                            </div>

                            {/* Signature Experiences Grid */}
                            {signatureExperiences.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {signatureExperiences.filter(exp => exp.is_active).map((experience) => (
                                        <div 
                                            key={experience.id}
                                            className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden luxury-shadow transition-all duration-300 transition-all duration-500 transform hover:-translate-y-2 border ${theme.cardBorder || theme.border}`}
                                        >
                                            {/* Image Container */}
                                            <div className="relative h-64 overflow-hidden">
                                                <img 
                                                    src={getImageUrl(experience.image_url)} 
                                                    alt={experience.title} 
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                    />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 space-y-3">
                                                <h3 className={`text-xl font-bold ${theme.textCardPrimary || theme.textPrimary} group-hover:${theme.textCardAccent || theme.textAccent} transition-colors line-clamp-2`}>
                                                    {experience.title}
                                                </h3>
                                                <p className={`${theme.textCardSecondary || theme.textSecondary} text-sm leading-relaxed line-clamp-3`}>
                                                    {experience.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`text-center py-12 ${theme.textSecondary}`}>No signature experiences available at the moment.</p>
                            )}
                        </div>
                    </section>

                    {/* Premium Services Showcase Section */}
                    <section className={`${theme.bgCard} py-20 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-amber-500/10 text-amber-600 text-sm font-semibold tracking-widest uppercase rounded-full mb-4">
                                    ✦ Premium Services ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    WORLD-CLASS AMENITIES & SERVICES
                                </h2>
                                <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
                                    Experience unparalleled luxury with our comprehensive range of world-class amenities and personalized services
                                </p>
                            </div>

                            {/* Services Grid - 2 Column Layout with Images */}
                            {services.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {services.slice(0, 4).map((service) => (
                                        <div 
                                            key={service.id}
                                            className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden luxury-shadow transition-all duration-500 transform hover:-translate-y-2 border ${theme.border}`}
                                        >
                                            {/* Image Container */}
                                            <div className="relative h-48 overflow-hidden">
                                                {service.images && service.images.length > 0 ? (
                                                    <img 
                                                        src={getImageUrl(service.images[0].image_url)} 
                                                        alt={service.name} 
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20 flex items-center justify-center">
                                                        <ConciergeBell className={`w-12 h-12 ${theme.textAccent}`} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                                                
                                                {/* Multiple Images Indicator */}
                                                {service.images && service.images.length > 1 && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                                                            +{service.images.length - 1}
                                                        </span>
                                                </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 space-y-3">
                                                <h3 className={`text-lg font-bold ${theme.textCardPrimary || theme.textPrimary} group-hover:${theme.textCardAccent || theme.textAccent} transition-colors line-clamp-2`}>
                                                        {service.name}
                                                    </h3>
                                                <p className={`${theme.textCardSecondary || theme.textSecondary} text-sm leading-relaxed line-clamp-3`}>
                                                        {service.description}
                                                    </p>
                                                </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`text-center py-12 ${theme.textSecondary}`}>No services available at the moment.</p>
                            )}

                            {/* View More Button */}
                            {services.length > 4 && (
                                <div className="text-center mt-12">
                                    <button className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg rounded-full shadow-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 hover:shadow-amber-500/50">
                                        View All Services
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Premium Cuisine Section - Mountain Shadows Style */}
                    <section className={`bg-gradient-to-b ${theme.bgCard} ${theme.bgSecondary} py-20 pb-28 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-amber-500/10 text-amber-600 text-sm font-semibold tracking-widest uppercase rounded-full mb-4">
                                    ✦ Savor the Art ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    SAVOR THE ART OF CUISINE
                                </h2>
                                <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
                                    Experience the art of cuisine at our luxury resort. Enjoy a diverse menu featuring international favorites and authentic local flavors, crafted to delight every palate.
                                </p>
                            </div>

                            {/* Food Items Grid */}
                            {foodItems.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {foodItems.map((food) => (
                                        <div 
                                            key={food.id}
                                            className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden luxury-shadow transition-all duration-300 transition-all duration-500 transform hover:-translate-y-2 border ${theme.cardBorder || theme.border}`}
                                        >
                                            {/* Image */}
                                            <div className="relative h-40 overflow-hidden">
                                                <img 
                                                    src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com/${food.images?.[0]?.image_url}` : `http://localhost:8000/${food.images?.[0]?.image_url}`} 
                                                    alt={food.name} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                    onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                
                                                {/* Availability Badge */}
                                                <div className="absolute top-4 right-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${food.available ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                                        {food.available ? "Available" : "Unavailable"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5">
                                                <h3 className={`text-xl font-bold ${theme.textCardPrimary || theme.textPrimary} group-hover:${theme.textCardAccent || theme.textAccent} transition-colors mb-2 line-clamp-2`}>
                                                    {food.name}
                                                </h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`text-center py-12 ${theme.textSecondary}`}>No food items available at the moment.</p>
                            )}

                            {/* View More Button */}
                            {foodItems.length > 8 && (
                                <div className="text-center mt-12">
                                    <button className="px-10 py-4 bg-white text-amber-600 font-bold text-lg rounded-full border-2 border-amber-600 hover:bg-amber-50 transition-all duration-300">
                                        View Full Menu
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Premium Gallery Section - Mountain Shadows Style */}
                    <section className={`bg-gradient-to-b ${theme.bgCard} ${theme.bgSecondary} py-20 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-amber-500/10 text-amber-600 text-sm font-semibold tracking-widest uppercase rounded-full mb-4">
                                    ✦ Captured Moments ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    EXPLORE THE TIMELESS BEAUTY
                                </h2>
                                <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
                                    Witness the charm of our resort's stunning views and unforgettable experiences
                                </p>
                            </div>

                            {/* Gallery Grid */}
                            {galleryImages.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-auto gap-4" style={{overflow: 'visible'}}>
                                    {galleryImages.map((image, index) => (
                                            <div 
                                            key={image.id} 
                                            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 reveal"
                                            style={{ height: getGalleryCardHeight(index), transitionDelay: `${(index % 5) * 70}ms` }}
                                        >
                                            <img 
                                                src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com${image.image_url}` : `http://localhost:8000${image.image_url}`} 
                                                alt={image.caption || 'Gallery image'} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                loading="lazy"
                                                onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                            />
                                            
                                            {/* Overlay on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-6">
                                                {image.caption && (
                                                    <p className="text-white text-lg font-semibold drop-shadow-lg">
                                                        {image.caption}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`text-center py-12 ${theme.textSecondary}`}>No gallery images available at the moment.</p>
                            )}

                            {/* View More Button removed: grid now wraps into multiple rows automatically */}
                        </div>
                    </section>
                    
                    {/* Plan Your Wedding Section - Dynamic with Slider */}
                    {planWeddings.length > 0 && planWeddings.some(w => w.is_active) && (
                        <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
                            {planWeddings.filter(w => w.is_active).map((wedding, index) => (
                                <div key={wedding.id}>
                                    {/* Background Images with Animation and Auto-Change */}
                                    <div className="absolute inset-0">
                                        <img 
                                            src={getImageUrl(wedding.image_url)} 
                                            alt={wedding.title} 
                                            className={`absolute inset-0 w-[110%] h-[110%] object-cover object-center transition-all duration-[10000ms] ease-in-out ${index === currentWeddingIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} animate-[slow-pan_20s_ease-in-out_infinite]`}
                                            style={{
                                                animationDelay: `${index * 2}s`,
                                                animationDirection: index % 2 === 0 ? 'alternate' : 'alternate-reverse'
                                            }}
                                            onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }}
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30"></div>
                                    </div>

                                    {/* Content Overlay */}
                                    <div className={`relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-in-out ${index === currentWeddingIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                        <div className="max-w-5xl mx-auto text-center text-white">
                                            {/* Badge */}
                                            <div className="mb-6 inline-block px-6 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full border border-amber-400/30 animate-[fadeInUp_1s_ease-out]">
                                                <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">
                                                    ✦ Perfect Venue ✦
                                                </span>
                                            </div>

                                            {/* Main Title */}
                                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-extrabold mb-6 animate-[fadeInUp_1.2s_ease-out] drop-shadow-2xl leading-tight">
                                                {wedding.title.split(' ').slice(0, 3).join(' ')}<br/>
                                                <span className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                                                    {wedding.title.split(' ').slice(3).join(' ') || 'WEDDING DESTINATION'}
                                                </span>
                                            </h2>

                                            {/* Description */}
                                            <p className="text-base md:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8 animate-[fadeInUp_1.4s_ease-out] drop-shadow-lg">
                                                {wedding.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Navigation Dots */}
                            {planWeddings.filter(w => w.is_active).length > 1 && (
                                <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                                    {planWeddings.filter(w => w.is_active).map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentWeddingIndex(index)}
                                            className={`transition-all duration-300 ${
                                                index === currentWeddingIndex
                                                    ? "w-12 h-1 bg-amber-400 rounded-full"
                                                    : "w-8 h-1 bg-white/40 hover:bg-white/60 rounded-full"
                                            }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Nearby Attractions Section - Mountain Shadows Style */}
                    {nearbyAttractions.length > 0 && nearbyAttractions.some(a => a.is_active) && (
                        <section className={`bg-gradient-to-b ${theme.bgCard} ${theme.bgSecondary} py-20 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                                <div className="text-center mb-16">
                                    <span className={`inline-block px-6 py-2 bg-amber-500/10 ${theme.textAccent} text-sm font-semibold tracking-widest uppercase rounded-full mb-4`}>
                                    ✦ Explore ✦
                                </span>
                                    <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    NEARBY ATTRACTIONS
                                </h2>
                            </div>

                                {/* Split Layout - Image Left, Text Right or vice versa */}
                                <div className="space-y-12">
                                    {nearbyAttractions.filter(attr => attr.is_active).map((attraction, index) => (
                                        <div 
                                            key={attraction.id} 
                                            className={`${theme.bgCard} rounded-3xl overflow-hidden shadow-2xl border ${theme.border} transition-all duration-500 hover:shadow-3xl`}
                                        >
                                            <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-stretch`}>
                                                {/* Image Section */}
                                                <div className="w-full md:w-1/2 h-80 md:h-96 overflow-hidden">
                                                    <img 
                                                        src={getImageUrl(attraction.image_url)} 
                                                        alt={attraction.title} 
                                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                                                onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                            />
                                            </div>
                                                
                                                {/* Content Section */}
                                                <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center ${theme.bgCard}`}>
                                                    <h3 className={`text-3xl md:text-4xl font-extrabold ${theme.textPrimary} mb-4 leading-tight`}>
                                                        {attraction.title}
                                                    </h3>
                                                    <div className="w-20 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mb-6"></div>
                                                    <p className={`text-base md:text-lg ${theme.textSecondary} leading-relaxed`}>
                                                        {attraction.description}
                                                    </p>
                                                </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    )}


                    {/* Reviews Section */}
                    <section>
                        <h2 className={`group ${sectionTitleStyle}`}>
                            <Quote className={`inline-block mr-3 mb-1 ${iconStyle}`} /> What Our Guests Say
                        </h2>
                        <div className="w-full overflow-hidden" >
                           <div className="flex gap-4 animate-[auto-scroll-bobbing-reverse_90s_linear_infinite] hover:[animation-play-state:paused]" >
                                {reviews.length > 0 ? [...reviews, ...reviews].map((review, index) => (
                                    <div key={`${review.id}-${index}`} className={`group flex-none w-80 md:w-96 ${theme.bgCard} rounded-2xl p-4 shadow-2xl border ${theme.border}`} >
                                        <div className="flex justify-center mb-4" >
                                            {[...Array(review.rating)].map((_, i) => <Star key={i} className={`w-5 h-5 fill-current ${theme.textAccent}`} />)}
                                            {[...Array(5 - review.rating)].map((_, i) => <Star key={i + review.rating} className={`${theme.textSecondary} w-5 h-5`} />)}
                                        </div>
                                        <p className={`text-sm italic mb-4 ${textSecondary}`} >{`"${review.comment}"`}</p>
                                        <p className={`font-semibold ${textPrimary}`} >- {review.guest_name}</p>
                                    </div>
                                )) : <p className={`flex-none w-full text-center ${textSecondary}`} >No reviews available.</p>}
                            </div >
                        </div>
                    </section>
                </main>

                {/* Floating UI Elements */}
                <button onClick={scrollToTop} className={`fixed bottom-8 right-8 p-3 rounded-full ${theme.buttonBg} ${theme.buttonText} shadow-lg transition-all duration-300 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} aria-label="Back to Top">
                    <ChevronUp className="w-6 h-6" />
                </button>

                <button onClick={toggleChat} className={`fixed bottom-8 left-8 p-4 rounded-full ${theme.buttonBg} ${theme.buttonText} shadow-lg transition-all duration-300 z-50 ${theme.buttonHover}`} aria-label="Open Chat">
                    <MessageSquare className="w-6 h-6" />
                </button>

                {/* AI Concierge Chat Modal */}
                {isChatOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-end justify-center">
                        <div className={`w-full max-w-lg h-3/4 md:h-4/5 ${theme.chatBg} rounded-t-3xl shadow-2xl flex flex-col`}>
                            <div className={`${theme.chatHeaderBg} p-4 rounded-t-3xl flex items-center justify-between border-b ${theme.chatInputBorder}`}>
                                <h3 className="text-lg font-bold flex items-center"><MessageSquare className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> AI Concierge</h3>
                                <button onClick={toggleChat} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <div ref={chatMessagesRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-xl max-w-xs md:max-w-md shadow-lg ${msg.role === 'user' ? `${theme.chatUserBg} ${theme.chatUserText} rounded-br-none` : `${theme.chatModelBg} ${theme.chatModelText} rounded-bl-none`}`}>
                                            <p className="text-sm break-words">{msg.parts[0].text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className={`p-3 rounded-xl ${theme.chatModelBg} shadow-lg`}>
                                            <div className="flex items-center space-x-2 animate-bounce-dot">
                                                <div className={`w-2 h-2 ${theme.chatLoaderBg} rounded-full`} style={{ animationDelay: '0s' }}></div>
                                                <div className={`w-2 h-2 ${theme.chatLoaderBg} rounded-full`} style={{ animationDelay: '0.2s' }}></div>
                                                <div className={`w-2 h-2 ${theme.chatLoaderBg} rounded-full`} style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleSendMessage} className={`p-4 border-t ${theme.chatInputBorder} ${theme.chatHeaderBg} flex items-center`}>
                                <input type="text" value={userMessage} onChange={(e) => setUserMessage(e.target.value)} placeholder="Ask me anything..."
                                    className={`flex-1 p-3 rounded-full ${theme.chatInputBg} ${theme.textPrimary} ${theme.chatInputPlaceholder} focus:outline-none focus:ring-2 focus:ring-amber-500`} />
                                <button type="submit" className={`ml-2 p-3 rounded-full ${theme.buttonBg} ${theme.buttonText} ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={!userMessage.trim() || isChatLoading}>
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                
                {/* General Booking Modal - Date Selection First */}
                {isGeneralBookingOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`w-full max-w-md ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><BedDouble className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Select Your Dates</h3>
                                <button onClick={() => setIsGeneralBookingOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className={`${theme.textSecondary} text-center mb-4`}>Select your check-in and check-out dates to view available rooms</p>
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-in Date</label>
                                        <input 
                                            type="date" 
                                            name="check_in" 
                                            value={bookingData.check_in} 
                                            onChange={handleRoomBookingChange} 
                                            min={new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} 
                                        />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-out Date</label>
                                        <input 
                                            type="date" 
                                            name="check_out" 
                                            value={bookingData.check_out} 
                                            onChange={handleRoomBookingChange} 
                                            min={bookingData.check_in || new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} 
                                        />
                                    </div>
                                </div>
                                {bookingData.check_in && bookingData.check_out && (
                                    <div className="pt-4 space-y-3 border-t border-gray-200 dark:border-neutral-700">
                                        <p className={`text-sm ${theme.textSecondary} text-center`}>Continue with booking:</p>
                                <button 
                                    onClick={() => { setIsGeneralBookingOpen(false); setIsRoomBookingFormOpen(true); }}
                                    className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors flex items-center justify-center space-x-2`}
                                >
                                    <BedDouble className="w-5 h-5" />
                                    <span>Book a Room</span>
                                </button>
                                <button 
                                            onClick={() => { 
                                                setIsGeneralBookingOpen(false);
                                                // Copy dates from bookingData to packageBookingData
                                                setPackageBookingData(prev => ({ 
                                                    ...prev,
                                                    check_in: bookingData.check_in || prev.check_in || '',
                                                    check_out: bookingData.check_out || prev.check_out || ''
                                                }));
                                                setIsPackageSelectionOpen(true); 
                                            }}
                                    className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors flex items-center justify-center space-x-2`}
                                >
                                    <Package className="w-5 h-5" />
                                    <span>Book a Package</span>
                                </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Room Booking Modal */}
                {isRoomBookingFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <div className={`w-full max-w-lg ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-8`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><BedDouble className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Book a Room</h3>
                                <button onClick={() => setIsRoomBookingFormOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            {/* Error message inside modal */}
                            {bannerMessage.text && bannerMessage.type === 'error' && (
                                <div className={`mx-6 mt-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm flex items-center`}>
                                    <span className="mr-2">❌</span>
                                    {bannerMessage.text}
                                </div>
                            )}
                            {/* Success message inside modal */}
                            {bannerMessage.text && bannerMessage.type === 'success' && (
                                <div className={`mx-6 mt-4 p-3 rounded-lg bg-green-100 border border-green-300 text-green-700 text-sm flex items-center`}>
                                    <span className="mr-2">✅</span>
                                    {bannerMessage.text}
                                </div>
                            )}
                            <form onSubmit={handleRoomBookingSubmit} className="p-4 space-y-4 overflow-y-auto">
                                {/* Always show editable date inputs */}
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-in Date</label>
                                        <input 
                                            type="date" 
                                            name="check_in" 
                                            value={bookingData.check_in || ''} 
                                            onChange={handleRoomBookingChange} 
                                            min={new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} 
                                        />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-out Date</label>
                                        <input 
                                            type="date" 
                                            name="check_out" 
                                            value={bookingData.check_out || ''} 
                                            onChange={handleRoomBookingChange} 
                                            min={bookingData.check_in || new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Available Rooms for Selected Dates</label>
                                    {!bookingData.check_in || !bookingData.check_out ? (
                                        <div className={`p-6 text-center rounded-xl ${theme.bgSecondary} border-2 border-dashed ${theme.border}`}>
                                            <BedDouble className={`w-10 h-10 ${theme.textSecondary} mx-auto mb-3`} />
                                            <p className={`text-sm ${theme.textSecondary}`}>Please select check-in and check-out dates above to see available rooms</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className={`text-xs ${theme.textSecondary} mb-2`}>Showing rooms available from {bookingData.check_in} to {bookingData.check_out}</p>
                                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-3 rounded-xl ${theme.bgSecondary}`}>
                                                {rooms.length > 0 ? (
                                                    rooms.map(room => (
                                                <div key={room.id} onClick={() => handleRoomSelection(room.id)}
                                                    className={`rounded-lg border-2 cursor-pointer transition-all duration-200 overflow-hidden ${bookingData.room_ids.includes(room.id) ? `${theme.buttonBg} ${theme.buttonText} border-transparent` : `${theme.bgCard} ${theme.textPrimary} ${theme.border} hover:border-amber-500`}`}
                                                >
                                                    <img 
                                                        src={getImageUrl(room.image_url)} 
                                                        alt={room.type} 
                                                        className="w-full h-20 object-cover" 
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                    />
                                                    <div className="p-2 text-center">
                                                        <p className="font-semibold text-xs">Room {room.number}</p>
                                                        <p className="text-xs opacity-80">{room.type}</p>
                                                        <p className="text-xs opacity-60 mt-1">Max: {room.adults}A, {room.children}C</p>
                                                        <p className="text-xs font-bold mt-1">{formatCurrency(room.price)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-8 text-gray-500">
                                                        <BedDouble className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                        <p className="text-sm font-semibold mb-1">No rooms available</p>
                                                        <p className="text-xs">No rooms are available for the selected dates. Please try different dates.</p>
                                            </div>
                                        )}
                                    </div>
                                        </>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Full Name</label>
                                    <input type="text" name="guest_name" value={bookingData.guest_name} onChange={handleRoomBookingChange} placeholder="Enter your full name" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Email Address</label>
                                    <input type="email" name="guest_email" value={bookingData.guest_email} onChange={handleRoomBookingChange} placeholder="user@example.com" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Phone Number</label>
                                    <input type="tel" name="guest_mobile" value={bookingData.guest_mobile} onChange={handleRoomBookingChange} placeholder="Enter your mobile number" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Adults</label>
                                        <input type="number" name="adults" value={bookingData.adults} onChange={handleRoomBookingChange} min="1" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Children</label>
                                        <input type="number" name="children" value={bookingData.children} onChange={handleRoomBookingChange} min="0" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                </div>
                                <button type="submit" className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={isBookingLoading}>
                                    {isBookingLoading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                                {bookingMessage.text && (
                                    <div className={`mt-4 p-3 rounded-xl text-center ${bookingMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {bookingMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* Package Booking Modal */}
                {isPackageBookingFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <div className={`w-full max-w-lg ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-8`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><Package className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Book a Package</h3>
                                <button onClick={() => setIsPackageBookingFormOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            {/* Error message inside modal */}
                            {bannerMessage.text && bannerMessage.type === 'error' && (
                                <div className={`mx-6 mt-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm flex items-center`}>
                                    <span className="mr-2">❌</span>
                                    {bannerMessage.text}
                                </div>
                            )}
                            {/* Success message inside modal */}
                            {bannerMessage.text && bannerMessage.type === 'success' && (
                                <div className={`mx-6 mt-4 p-3 rounded-lg bg-green-100 border border-green-300 text-green-700 text-sm flex items-center`}>
                                    <span className="mr-2">✅</span>
                                    {bannerMessage.text}
                                </div>
                            )}
                            <form onSubmit={handlePackageBookingSubmit} className="p-4 space-y-4 overflow-y-auto">
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Package ID</label>
                                    <input type="number" name="package_id" value={packageBookingData.package_id || ''} readOnly className={`w-full p-3 rounded-xl ${theme.placeholderBg} ${theme.placeholderText} focus:outline-none`} />
                                </div>
                                {/* Always show editable date inputs */}
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-in Date</label>
                                        <input 
                                            type="date" 
                                            name="check_in" 
                                            value={packageBookingData.check_in || ''} 
                                            onChange={handlePackageBookingChange} 
                                            min={new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} 
                                        />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-out Date</label>
                                        <input 
                                            type="date" 
                                            name="check_out" 
                                            value={packageBookingData.check_out || ''} 
                                            onChange={handlePackageBookingChange} 
                                            min={packageBookingData.check_in || new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Available Rooms for Selected Dates</label>
                                    {!packageBookingData.check_in || !packageBookingData.check_out ? (
                                        <div className={`p-6 text-center rounded-xl ${theme.bgSecondary} border-2 border-dashed ${theme.border}`}>
                                            <BedDouble className={`w-10 h-10 ${theme.textSecondary} mx-auto mb-3`} />
                                            <p className={`text-sm ${theme.textSecondary}`}>Please select check-in and check-out dates above to see available rooms</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className={`text-xs ${theme.textSecondary} mb-2`}>Showing rooms available from {packageBookingData.check_in} to {packageBookingData.check_out}</p>
                                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-3 rounded-xl ${theme.bgSecondary}`}>
                                                {rooms.length > 0 ? (
                                                    rooms.map(room => {
                                                        const isAvailable = Object.keys(packageRoomAvailability).length === 0 || packageRoomAvailability[room.id] !== false;
                                                        return (
                                                <div 
                                                    key={room.id} 
                                                    onClick={() => isAvailable && handlePackageRoomSelection(room.id)}
                                                    className={`rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                                                        !isAvailable 
                                                            ? 'opacity-50 cursor-not-allowed bg-gray-300 border-gray-400' 
                                                            : `cursor-pointer ${packageBookingData.room_ids.includes(room.id) ? `${theme.buttonBg} ${theme.buttonText} border-transparent` : `${theme.bgCard} ${theme.textPrimary} ${theme.border} hover:border-amber-500`}`
                                                    }`}
                                                >
                                                    <img 
                                                        src={getImageUrl(room.image_url)} 
                                                        alt={room.type} 
                                                        className="w-full h-20 object-cover" 
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                    />
                                                    <div className="p-2 text-center">
                                                        <p className="font-semibold text-xs">Room {room.number}</p>
                                                        <p className="text-xs opacity-80">{room.type}</p>
                                                        <p className="text-xs opacity-60 mt-1">Max: {room.adults}A, {room.children}C</p>
                                                        <p className="text-xs font-bold mt-1">{formatCurrency(room.price)}</p>
                                                        {!isAvailable && (
                                                            <p className="text-xs text-red-600 font-bold mt-1">Unavailable</p>
                                                        )}
                                                    </div>
                                                </div>
                                                        );
                                                    })
                                        ) : (
                                            <div className="col-span-full text-center py-8 text-gray-500">
                                                        <BedDouble className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                        <p className="text-sm font-semibold mb-1">No rooms available</p>
                                                        <p className="text-xs">No rooms are available for the selected dates. Please try different dates.</p>
                                            </div>
                                        )}
                                    </div>
                                        </>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Full Name</label>
                                    <input type="text" name="guest_name" value={packageBookingData.guest_name} onChange={handlePackageBookingChange} placeholder="Enter your full name" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Email Address</label>
                                    <input type="email" name="guest_email" value={packageBookingData.guest_email || ''} onChange={handlePackageBookingChange} placeholder="user@example.com (optional)" className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Phone Number</label>
                                    <input type="tel" name="guest_mobile" value={packageBookingData.guest_mobile} onChange={handlePackageBookingChange} placeholder="Enter your mobile number" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Adults</label>
                                        <input type="number" name="adults" value={packageBookingData.adults} onChange={handlePackageBookingChange} min="1" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Children</label>
                                        <input type="number" name="children" value={packageBookingData.children} onChange={handlePackageBookingChange} min="0" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                </div>
                                <button type="submit" className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={isBookingLoading}>
                                    {isBookingLoading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                                {bookingMessage.text && (
                                    <div className={`mt-4 p-3 rounded-xl text-center ${bookingMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {bookingMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* Package Selection Modal */}
                {isPackageSelectionOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <div className={`w-full max-w-4xl ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-8`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><Package className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Select a Package</h3>
                                <button onClick={() => setIsPackageSelectionOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                {packages.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {packages.map((pkg) => {
                                            const imgIndex = packageImageIndex[pkg.id] || 0;
                                            const currentImage = pkg.images && pkg.images[imgIndex];
                                            return (
                                                <div 
                                                    key={pkg.id}
                                                    onClick={() => {
                                                        handleOpenPackageBookingForm(pkg.id);
                                                        setIsPackageSelectionOpen(false);
                                                    }}
                                                    className={`${theme.bgCard} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border ${theme.border} cursor-pointer transform hover:-translate-y-1`}
                                                >
                                                    {/* Image Container */}
                                                    <div className="relative h-48 overflow-hidden">
                                                        <img 
                                                            src={currentImage ? getImageUrl(currentImage.image_url) : ITEM_PLACEHOLDER} 
                                                            alt={pkg.title} 
                                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                                                            onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                        />
                                                        {/* Image Slider Dots */}
                                                        {pkg.images && pkg.images.length > 1 && (
                                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full z-10">
                                                                {pkg.images.map((_, imgIdx) => (
                                                                    <button
                                                                        key={imgIdx}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setPackageImageIndex(prev => ({ ...prev, [pkg.id]: imgIdx }));
                                                                        }}
                                                                        className={`w-2 h-2 rounded-full transition-all ${imgIdx === imgIndex ? 'bg-white' : 'bg-white/40'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-5">
                                                        <h3 className={`text-xl font-bold ${theme.textCardPrimary || theme.textPrimary} mb-2 line-clamp-2`}>
                                                            {pkg.title}
                                                        </h3>
                                                        <p className={`text-sm ${theme.textCardSecondary || theme.textSecondary} mb-3 line-clamp-2`}>
                                                            {pkg.description}
                                                        </p>
                                                        <div className={`flex items-center justify-between pt-3 border-t ${theme.cardBorder || theme.border}`}>
                                                            <span className={`text-2xl font-extrabold ${theme.textCardAccent || theme.textAccent}`}>
                                                                {formatCurrency(pkg.price || 0)}
                                                            </span>
                                                            <button 
                                                                className={`px-6 py-2 text-sm font-bold ${theme.buttonBg} ${theme.buttonText} rounded-full shadow-lg ${theme.buttonHover} transition-all duration-300 transform hover:scale-105`}
                                                            >
                                                                Select
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Package className={`w-16 h-16 ${theme.textSecondary} mx-auto mb-4`} />
                                        <p className={`${theme.textSecondary}`}>No packages available at the moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Service Booking Modal */}
                {isServiceBookingFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`w-full max-w-lg ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><ConciergeBell className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Book a Service</h3>
                                <button onClick={() => setIsServiceBookingFormOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleServiceBookingSubmit} className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Service ID</label>
                                    <input type="number" name="service_id" value={serviceBookingData.service_id || ''} readOnly className={`w-full p-3 rounded-xl ${theme.placeholderBg} ${theme.placeholderText} focus:outline-none`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Full Name</label>
                                    <input type="text" name="guest_name" value={serviceBookingData.guest_name} onChange={handleServiceBookingChange} placeholder="Enter your full name" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Email Address</label>
                                    <input type="email" name="guest_email" value={serviceBookingData.guest_email} onChange={handleServiceBookingChange} placeholder="user@example.com" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Phone Number</label>
                                    <input type="tel" name="guest_mobile" value={serviceBookingData.guest_mobile} onChange={handleServiceBookingChange} placeholder="Enter your mobile number" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Room ID (Optional)</label>
                                    <input type="number" name="room_id" value={serviceBookingData.room_id || ''} onChange={handleServiceBookingChange} placeholder="Enter your room ID if assigned" className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <button type="submit" className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={isBookingLoading}>
                                    {isBookingLoading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                                {bookingMessage.text && (
                                    <div className={`mt-4 p-3 rounded-xl text-center ${bookingMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {bookingMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
                
                {/* Food Order Modal */}
                {isFoodOrderFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`w-full max-w-lg ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><Coffee className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Place a Food Order</h3>
                                <button onClick={() => setIsFoodOrderFormOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleFoodOrderSubmit} className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Room ID</label>
                                    <input type="number" name="room_id" value={foodOrderData.room_id || ''} onChange={(e) => setFoodOrderData(prev => ({ ...prev, room_id: parseInt(e.target.value) || '' }))} placeholder="Enter your room ID" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <h4 className={`text-md font-semibold ${theme.textPrimary}`}>Select Items:</h4>
                                <div className="space-y-4 max-h-60 overflow-y-auto">
                                    {foodItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <img src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com/${item.images?.[0]?.image_url}` : `http://localhost:8000/${item.images?.[0]?.image_url}`} alt={item.name} className="w-12 h-12 object-cover rounded-full" />
                                                <div>
                                                    <p className={`font-semibold ${theme.textPrimary}`}>{item.name}</p>
                                                </div>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                value={foodOrderData.items[item.id] || 0}
                                                onChange={(e) => handleFoodOrderChange(e, item.id)}
                                                className={`w-20 p-2 text-center rounded-lg ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button type="submit" className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={isBookingLoading}>
                                    {isBookingLoading ? 'Placing Order...' : 'Place Order'}
                                </button>
                                {bookingMessage.text && (
                                    <div className={`mt-4 p-3 rounded-xl text-center ${bookingMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {bookingMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
                
                <footer className={`${theme.bgSecondary} py-8 px-4 md:px-12 mt-12`}>
                    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        {resortInfo && (
                            <>
                                <div className="text-center md:text-left">
                                    <h3 className={`text-xl font-bold tracking-tight ${theme.textPrimary}`}>{resortInfo.name}</h3>
                                    <p className={`text-sm ${theme.textSecondary} mt-1`}>{resortInfo.address}</p>
                                    <p className={`text-xs ${theme.textSecondary} mt-2`}>&copy; 2024 Elysian Retreat. All Rights Reserved.</p>
                                </div>
                                <div className="flex space-x-4">
                                    <a href={formatUrl(resortInfo.facebook)} target="_blank" rel="noopener noreferrer" className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Facebook /></a>
                                    <a href={formatUrl(resortInfo.instagram)} target="_blank" rel="noopener noreferrer" className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Instagram /></a>
                                    <a href={formatUrl(resortInfo.twitter)} target="_blank" rel="noopener noreferrer" className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Twitter /></a>
                                    <a href={formatUrl(resortInfo.linkedin)} target="_blank" rel="noopener noreferrer" className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><Linkedin /></a>
                                </div>
                            </>
                        )}
                    </div>
                </footer>
            </div>
        </>
    );
}