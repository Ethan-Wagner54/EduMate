import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Users, Calendar, TrendingUp, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Register from "./Register";

import logoImage from '../assets/edumateLogo.jpg';

export default function HomePage()
{
    const [currentPage, setCurrentPage] = useState("home");
    const navigate = useNavigate();

    // Conditional rendering for registration page
    if (currentPage === "registration") {
        return <Register />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-950 to-black">
            {/* Header */}
            <header className = "container mx-auto px-4 py-6">
                <div className = "flex items-center justify-between">
                    <nav className = "flex items-center space-x-3">
                        <img
                            src = {logoImage}
                            alt = "EduMate Logo"
                            className = "w-12 h-12"
                        />
                        <span className = "text-2xl font-semibold text-white">EduMate</span>
                    </nav>
                    <nav className = "flex items-center space-x-4">
                        <Button variant = "ghost" className = "text-white hover:bg-purple-600" onClick={() => navigate("/login")}>
                            Sign In
                        </Button>
                        <Button
                            className = "bg-purple-600 text-white hover:bg-purple-700"
                           onClick={() => navigate("/register")}
                        >
                            Get Started
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className = "container mx-auto px-4 py-20">
                <div className = "text-center max-w-4xl mx-auto">
                    <h1 className = "text-5xl font-bold text-white mb-6">
                        Connect, Learn, and Grow with
                        <span className = "block text-purple-200">Expert Tutoring</span>
                    </h1>
                    <p className = "text-xl text-purple-100 mb-8 leading-relaxed">
                        Join our community of learners and educators. Connect with peers,
                        share knowledge and grow together through collaborative learning
                        experiences.
                    </p>
                    <div className = "flex justify-center mb-12">
                        <Button
                            size = "lg"
                            className = "bg-purple-600 text-white hover:bg-purple-700 px-8 py-6"
                            onClick = {() => setCurrentPage("registration")}
                        >
                            Join EduMate
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>

                    {/* Tutoring Image */}
                    <div className = "flex justify-center">
                        <div className = "relative">
                            <img
                                src="null"
                                alt ="TutoringImage"
                                className="rounded-2xl shadow-2xl max-w-2xl w-full opacity-90 border border-white/10"
                            /> 
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Features Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Why Choose EduMate?
                    </h2>
                    <p className="text-purple-100 text-lg">
                        It has everything you need for successful learning
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Feature Cards */}
                    {[{
                        icon: <Users className="h-6 w-6 text-white" />,
                        title: "Expert Tutors",
                        description: "Connect with qualified tutors across various subjects and skill levels"
                    }, {
                        icon: <Calendar className="h-6 w-6 text-white" />,
                        title: "Flexible Scheduling",
                        description: "Book sessions that fit your schedule with our easy-to-use calendar system"
                    }, {
                        icon: <TrendingUp className="h-6 w-6 text-white" />,
                        title: "Track Progress",
                        description: "Monitor your learning journey with detailed progress tracking and analytics"
                    }, {
                        icon: <Star className="h-6 w-6 text-white" />,
                        title: "Quality Assured",
                        description: "Rated sessions and verified tutors ensure high-quality learning experiences"
                    }].map((feature, index) => (
                        <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
                            <CardHeader className="text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    {feature.icon}
                                </div>
                                <CardTitle className="text-white">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-purple-100 text-center">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Ready to Start Your Learning Journey?
                    </h2>
                    <p className="text-xl text-purple-100 mb-8">
                        Join hundreds of students who are already improving their grades and skills with EduMate
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-6"
                            onClick={() => setCurrentPage("registration")}
                        >
                            Create Account
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-6"
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center space-x-3">
                    <img
                        src={logoImage}
                        alt="EduMate Logo"
                        className="w-5 h-5"
                    />
                    <p className="text-purple-100 text-sm">
                        © 2025 EduMate. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

