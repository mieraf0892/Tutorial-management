import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Video, Download, ExternalLink } from "lucide-react";

export default function FreeResources() {
    const resources = [
        {
            id: 1,
            title: "Mathematics Fundamentals PDF",
            type: "PDF",
            category: "Math",
            description: "A comprehensive guide to basic algebra and geometry concepts.",
            icon: FileText,
            color: "text-red-500",
            bg: "bg-red-50",
        },
        {
            id: 2,
            title: "Physics Mechanics Intro",
            type: "Video",
            category: "Physics",
            description: "Watch the introductory lecture on Newtonian mechanics.",
            icon: Video,
            color: "text-blue-500",
            bg: "bg-blue-50",
        },
        {
            id: 3,
            title: "Chemistry Periodic Table",
            type: "Chart",
            category: "Chemistry",
            description: "High-resolution periodic table with element details.",
            icon: ExternalLink,
            color: "text-green-500",
            bg: "bg-green-50",
        },
        {
            id: 4,
            title: "English Grammar Cheat Sheet",
            type: "PDF",
            category: "Language",
            description: "Quick reference for common grammar rules and usage.",
            icon: FileText,
            color: "text-orange-500",
            bg: "bg-orange-50",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Free Learning Resources</h2>
                <p className="text-muted-foreground">
                    Access these complimentary materials to get started with your learning journey.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer border-slate-200">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className={`p-2 rounded-lg ${resource.bg} w-fit`}>
                                    <resource.icon className={`w-6 h-6 ${resource.color}`} />
                                </div>
                                <Badge variant="secondary" className="font-normal">
                                    {resource.category}
                                </Badge>
                            </div>
                            <CardTitle className="mt-4 text-lg">{resource.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {resource.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full gap-2 group">
                                <Download className="w-4 h-4 group-hover:text-primary transition-colors" />
                                Download Resource
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
