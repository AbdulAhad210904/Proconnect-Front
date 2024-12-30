"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { useDispatch } from 'react-redux';
import { createProject } from '@/store/posted-projects/projectThunk';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { X } from 'lucide-react';
import Modal from "@/components/modals/modal";


// Card components
const Card = ({ className, ...props }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`} {...props} />
);

const CardHeader = ({ className, ...props }) => (
  <div className={`p-4 sm:p-6 ${className}`} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h2 className={`text-xl sm:text-2xl font-semibold ${className}`} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={`p-6 sm:p-8 md:p-10 pt-0 w-full max-w-[80%] mx-auto ${className}`} {...props} />
);

// Input component
const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

// Label component
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  />
));
Label.displayName = "Label";

// Textarea component
const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// Select components
const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

const SelectItem = React.forwardRef(({ className, ...props }, ref) => (
  <option
    ref={ref}
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    {...props}
  />
));
SelectItem.displayName = "SelectItem";

export default function ProjectForm() {
  const dispatch = useDispatch();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    budget: {
      min: 1000,
      max: 5000,
      currency: 'USD'
    },
    location: {
      city: '',
      state: '',
      country: ''
    },
    deadline: '',
    status: 'open',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const countries = [
    "Belgium", 
    "Holland", 
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return { ...prev, [parent]: { ...prev[parent], [child]: value } };
      }
      return { ...prev, [name]: value };
    });
    // Clear validation error when user starts typing
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (formData.budget.min <= 0) errors['budget.min'] = 'Minimum budget must be greater than 0';
    if (formData.budget.max <= formData.budget.min) errors['budget.max'] = 'Maximum budget must be greater than minimum';
    if (!formData.location.city.trim()) errors['location.city'] = 'City is required';
    if (!formData.location.country.trim()) errors['location.country'] = 'Country is required';
    if (!formData.deadline) errors.deadline = 'Deadline is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);

    const newUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prevUrls => [...prevUrls, ...newUrls]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setPreviewUrls(prevUrls => {
      const newUrls = prevUrls.filter((_, i) => i !== index);
      URL.revokeObjectURL(prevUrls[index]);
      return newUrls;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    setError(null);
    const token = Cookies.get('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      setIsSubmitting(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      if (!userId) {
        setError('User ID not found in token. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      const projectData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'budget') {
          projectData.append('budget[min]', Number(value.min));
          projectData.append('budget[max]', Number(value.max));
          projectData.append('budget[currency]', value.currency);
        } else if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            projectData.append(`${key}[${subKey}]`, subValue);
          });
        } else {
          projectData.append(key, value);
        }
      });
      projectData.append('postedBy', userId);

      selectedFiles.forEach((file, index) => {
        projectData.append(`projectImages`, file);
      });

      await dispatch(createProject(projectData)).unwrap();
      console.log('Project submitted successfully');
      toast.success('Project submitted successfully');
      window.location.href = '/dashboard/individual';
    } catch (err) {
      console.error('Error submitting project:', err);
      setError(err.message || 'An error occurred while submitting the project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <ToastContainer />
    <main className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-[#27aae2]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Submit Your Project
          </h1>
          <p className="mt-4 text-lg text-white">
            Find the perfect professional for your job quickly and easily.
          </p>
        </div>
      </header>
      <Card className="w-11/12 max-w-6xl mx-auto my-8 sm:my-12 shadow-lg">
        <CardContent className="w-full">
          <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Fill in the details below to post your project and receive quotes from qualified professionals.
              </p>
              <h2 className="text-xl font-semibold mb-2">Project Details</h2>
              <div className="h-1 bg-[#27aae2] mb-6"></div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="block mb-1">Project Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="E.g., Bathroom renovation, 3 bedrooms"
                    className={`w-full ${validationErrors.title ? 'border-red-500' : ''}`}
                    required
                  />
                  {validationErrors.title && <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>}
                </div>
                <div>
                  <Label htmlFor="description" className="block mb-1">Project Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of your project. Include materials, specific tasks, and other relevant information."
                    className={`min-h-[150px] w-full ${validationErrors.description ? 'border-red-500' : ''}`}
                    required
                  />
                  {validationErrors.description && <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>}
                </div>
                <div>
                  <Label htmlFor="category" className="block mb-1">Project Category</Label>
                  <Select 
                    id="category" 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full ${validationErrors.category ? 'border-red-500' : ''}`}
                    required
                  >
                    <SelectItem value="">Select a category</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="gardening">Gardening</SelectItem>
                  </Select>
                  {validationErrors.category && <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>}
                </div>
                <div>
                  <Label htmlFor="subCategory" className="block mb-1">Sub-Category (Optional)</Label>
                  <Input
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    placeholder="E.g., Kitchen remodeling"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="block mb-2">Budget Range</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget.min" className="block mb-1">Minimum</Label>
                      <Input
                        type="number"
                        id="budget.min"
                        name="budget.min"
                        value={formData.budget.min}
                        onChange={handleInputChange}
                        placeholder="Minimum budget"
                        className={`w-full ${validationErrors['budget.min'] ? 'border-red-500' : ''}`}
                        required
                      />
                      {validationErrors['budget.min'] && <p className="text-red-500 text-xs mt-1">{validationErrors['budget.min']}</p>}
                    </div>
                    <div>
                      <Label htmlFor="budget.max" className="block mb-1">Maximum</Label>
                      <Input
                        type="number"
                        id="budget.max"
                        name="budget.max"
                        value={formData.budget.max}
                        onChange={handleInputChange}
                        placeholder="Maximum budget"
                        className={`w-full ${validationErrors['budget.max'] ? 'border-red-500' : ''}`}
                        required
                      />
                      {validationErrors['budget.max'] && <p className="text-red-500 text-xs mt-1">{validationErrors['budget.max']}</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="budget.currency" className="block mb-1">Currency</Label>
                  <Select 
                    id="budget.currency" 
                    name="budget.currency"
                    value={formData.budget.currency}
                    onChange={handleInputChange}
                    className="w-full"
                    required
                  >
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </Select>
                </div>
              </div>
            </div>

            <div>
      <h2 className="text-xl font-semibold mb-2">Project Location</h2>
      <div className="h-1 bg-[#27aae2] mb-6"></div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="location.city" className="block mb-1">City</Label>
          <Input 
            id="location.city" 
            name="location.city"
            value={formData.location.city}
            onChange={handleInputChange}
            placeholder="Enter your city" 
            className={`w-full ${validationErrors['location.city'] ? 'border-red-500' : ''}`}
            required
          />
          {validationErrors['location.city'] && <p className="text-red-500 text-xs mt-1">{validationErrors['location.city']}</p>}
        </div>
        <div>
          <Label htmlFor="location.state" className="block mb-1">State</Label>
          <Input 
            id="location.state" 
            name="location.state"
            value={formData.location.state}
            onChange={handleInputChange}
            placeholder="Enter your state" 
            className="w-full" 
          />
        </div>
        <div>
          <Label htmlFor="location.country" className="block mb-1">Country</Label>
          <select 
            id="location.country" 
            name="location.country"
            value={formData.location.country}
            onChange={handleInputChange}
            className={`w-full border ${validationErrors['location.country'] ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
            required
          >
            <option value="" disabled>Select your country</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          {validationErrors['location.country'] && <p className="text-red-500 text-xs mt-1">{validationErrors['location.country']}</p>}
        </div>
      </div>
    </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Project Timeline</h2>
              <div className="h-1 bg-[#27aae2] mb-6"></div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deadline" className="block mb-1">Project Deadline</Label>
                  <Input 
                    id="deadline" 
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className={`w-full ${validationErrors.deadline ? 'border-red-500' : ''}`}
                    required
                  />
                  {validationErrors.deadline && <p className="text-red-500 text-xs mt-1">{validationErrors.deadline}</p>}
                </div>
              </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Additional options</h2>
                <div className="h-1 bg-[#27aae2] mb-6"></div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectImages" className="block mb-1">Photos/Files Upload</Label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                        </svg>
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label
                            htmlFor="projectImages"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                          >
                            <span>Upload files</span>
                            <Input
                              id="projectImages"
                              name="projectImages"
                              type="file"
                              accept="image/*"
                              multiple
                              className="sr-only"
                              onChange={handleFileChange}
                              ref={fileInputRef}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB each</p>
                      </div>
                    </div>
                  </div>
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square relative overflow-hidden rounded-lg">
                            <Image
                              src={url}
                              alt={`Preview ${index + 1}`}
                              layout="fill"
                              objectFit="cover"
                              className="transition-transform group-hover:scale-110"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Review and Submit</h2>
              <div className="h-1 bg-[#27aae2] mb-6"></div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
                  type="button"
                  onClick={() => {
                    console.log('Review project:', formData);
                  }}
                >
                  Review Project
                </button>
                <button
                  className="bg-[#27aae2] text-white px-6 py-2 rounded hover:bg-[#2596be] transition-colors"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Project'}
                </button>
              </div>
            </div>
            <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Confirm Submission"
          buttons={[
            {
              label: "Cancel",
              onClick: () => setIsConfirmModalOpen(false),
              variant: "secondary"
            },
            {
              label: "OK",
              onClick: handleConfirmSubmit,
              variant: "primary"
            }
          ]}
        >
          <p>Are you sure you want to submit the project?</p>
        </Modal>
            <p className="text-sm text-gray-500">
              For questions, please contact us at{" "}
              <a
                href="mailto:contact@pro--connect.com"
                className="text-[#27aae2] hover:underline"
              >
                contact@pro--connect.com
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
    </>
  );
}