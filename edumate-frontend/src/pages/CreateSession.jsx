import { useState } from "react";
import {Calendar, Clock, MapPin, User, BookOpen, DollarSign, FileText} from "lucide-react"; // Icons for visual cues
import { Button } from "../components/ui/button"; 
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger,SelectValue} from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Link } from "react-router-dom";

export default function CreateSession()
{
    const [formData, setFormData] = useState({ // State to hold all form input values

        title: "",
        subject: "",
        date: "",
        time: "",
        duration: "",
        studentName: "",
        sessionType: "",
        location: "",
        rate: "",
        description: ""
    });

    //Generic input handler to update form state
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    //Form submission handler
    const handleSubmit = (e) => {
        e.preventDefault(); //Prevent page reload
        console.log("Session created:", formData); //Log form data for debugging
        alert("Session created successfully!");  //NB: can be replaced with an API call to backend
    };

    return (
        <Card className = "max-w-2xl mx-auto mt-10 p-6">
            <CardHeader>
                <CardTitle>Create a Tutoring Session</CardTitle>
                <CardDescription>Fill in the details below to schedule a session</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit = {handleSubmit} className = "space-y-4">
                    {/*Session Tile*/}
                    <div>
                        <Label>Session Title</Label>
                        <Input
                            placeholder = "e.g Algebra Basics"
                            value = {formData.title}
                            onChange = {(e) => handleInputChange("title", e.target.value)}
                        />
                    </div>

                    {/*Subject*/}
                    <div>
                        <Label>Subject</Label>
                        <Input
                            placeholder = "e,g Mathematics"
                            value = {formData.subject}
                            onChange = {(e) => handleInputChange("subject", e.target.value)}
                        />
                    </div>

                    {/*Date and Time*/}
                    <div className = "grid grid-cols-2 gap-4">
                        <div>
                            <Label>Date</Label>
                            <Input
                                type = "date"
                                value = {formData.time}
                                onChange = {(e) => handleInputChange("time", e.target.value)}
                            />
                        </div>
                    </div>

                    {/*Duration*/}
                    <div>
                        <Label>Duration (in minutes)</Label>
                        <Input
                            type="number"
                            placeholder = "e.g 60"
                            value = {formData.duration}
                            onChange = {(e) => handleInputChange("duration", e.target.value)}
                        />
                    </div>

                    {/*Student Name*/}
                    <div>
                        <Label>Student Name</Label>
                        <Input
                            placeholder = "e.g John Doe"
                            value = {formData.studentName}
                            onChange = {(e) => handleInputChange("studentName", e.target.value)}
                        />
                    </div>

                    {/*Session Type*/}
                    <div>
                        <Label>Session Type</Label>
                        <RadioGroup className="flex gap-4">
                            <RadioGroupItem
                                value="online"
                                checked={formData.sessionType === "online"}
                                onChange={() => handleInputChange("sessionType", "online")}
                                label="Online"
                            />
                            <RadioGroupItem
                                value="in-person"
                                checked={formData.sessionType === "in-person"}
                                onChange={() => handleInputChange("sessionType", "in-person")}
                                label="In-Person"
                            />
                        </RadioGroup>
                    </div>

                    {/*Location*/}
                    <div>
                        <Label>Location</Label>
                        <Input
                            placeholder = "e.g Library Room 4"
                            value = {formData.location}
                            onChange = {(e) => handleInputChange("location", e.target.value)}
                        />
                    </div>

                    {/* Rate */}
                    <div>
                        <Label>Rate (ZAR/hour)</Label>
                        <Input
                            type = "number"
                            placeholder = "e.g 250"
                            value = {formData.rate}
                            onChange = {(e) => handleInputChange("rate", e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label>Session Description</Label>
                        <Textarea
                            placeholder = "Add any notes or expectations for the session"
                            value = {formData.descrcdiption}
                            onChange = {(e) => handleInputChange("description", e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full mt-4">
                        Create Session
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}




