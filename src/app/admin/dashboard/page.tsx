'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Barlow } from 'next/font/google';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Save,
  ImagePlus,
  DollarSign,
} from "lucide-react";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface AdminUser {
  username: string;
  isAdmin: boolean;
}

interface Car {
  _id?: string;
  make: string;
  model: string;
  year: number | string;
  price: number | string;
  mileage: number | string;
  transmission: "Automatic" | "Manual";
  fuelType: "Gasoline" | "Diesel" | "Electric" | "Hybrid";
  bodyType: string;
  color: string;
  vin?: string;
  description?: string;
  features: string[];
  coverImage?: string;
  images: string[];
  status: "available" | "sold" | "reserved";
  createdAt?: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<Car>({
    make: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    transmission: "Automatic",
    fuelType: "Gasoline",
    bodyType: "",
    color: "",
    vin: "",
    description: "",
    features: [],
    coverImage: "",
    images: [],
    status: "available",
  });
  const [featureInput, setFeatureInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const router = useRouter();

  const fetchCars = async () => {
    try {
      const response = await fetch("/api/admin/cars");
      const data = await response.json();
      if (data.success) {
        setCars(data.cars);
        setFilteredCars(data.cars);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCars(cars);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCars(
        cars.filter(
          (car) =>
            car.make.toLowerCase().includes(query) ||
            car.model.toLowerCase().includes(query) ||
            car.year.toString().includes(query) ||
            car.color.toLowerCase().includes(query) ||
            car.bodyType.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, cars]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/verify");
      const data = await response.json();

      if (data.authenticated) {
        setUser(data.user);
        await fetchCars();
      } else {
        router.push("/admin/login");
      }
    } catch (error) {
      router.push("/admin/login");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCar(null);
    setFormData({
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      price: "",
      mileage: "",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "",
      color: "",
      vin: "",
      description: "",
      features: [],
      coverImage: "",
      images: [],
      status: "available",
    });
    setShowModal(true);
  };

  const openEditModal = (car: Car) => {
    setEditingCar(car);
    setFormData({
      ...car,
      year: car.year.toString(),
      mileage: car.mileage.toString(),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCar(null);
    setFeatureInput("");
    setImageUrlInput("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()],
      }));
      setImageUrlInput("");
    }
  };

  const removeImageUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate and transform year
      const yearNum = parseInt(formData.year.toString());
      if (
        isNaN(yearNum) ||
        yearNum < 1900 ||
        yearNum > new Date().getFullYear() + 1
      ) {
        alert(
          `Please enter a valid year between 1900 and ${
            new Date().getFullYear() + 1
          }`
        );
        return;
      }

      // Transform price string to number
      const submitData = {
        ...formData,
        year: yearNum,
        price: formData.price
          ? parseFloat(formData.price.toString().replace(/,/g, ""))
          : 0,
        mileage: formData.mileage
          ? parseFloat(formData.mileage.toString().replace(/,/g, ""))
          : 0,
      };

      const url = editingCar
        ? `/api/admin/cars/${editingCar._id}`
        : "/api/admin/cars";

      const method = editingCar ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchCars();
        closeModal();
      } else {
        alert(data.error || "Failed to save car");
      }
    } catch (error) {
      console.error("Error saving car:", error);
      alert("Error saving car");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return;

    try {
      const response = await fetch(`/api/admin/cars/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        await fetchCars();
      } else {
        alert(data.error || "Failed to delete car");
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      alert("Error deleting car");
    }
  };

  if (isLoading) {
    return (
      <div
        className={`${barlow.className} min-h-screen bg-gray-50 flex items-center justify-center`}
      >
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`${barlow.className} min-h-screen bg-gray-50`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-black">Car Management</h1>
              <span className="ml-4 text-sm text-gray-500">
                {filteredCars.length}{" "}
                {filteredCars.length === 1 ? "vehicle" : "vehicles"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Car
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by make, model, year, color, or body type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        {/* Cars Grid */}
        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <div
                key={car._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Car Image */}
                <div className="h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                  {car.coverImage ? (
                    <img
                      src={car.coverImage}
                      alt={`${car.year} ${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                  ) : null}
                  <ImagePlus
                    className={`w-16 h-16 text-gray-400 ${
                      car.coverImage ? "hidden" : ""
                    }`}
                  />
                </div>

                {/* Car Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-black">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {car.bodyType} • {car.color}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        car.status === "available"
                          ? "bg-green-100 text-green-800"
                          : car.status === "sold"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {car.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-black">
                        ${car.price.toLocaleString()}
                      </span>
                    </div>
                    <p>Mileage: {car.mileage.toLocaleString()} km</p>
                    <p>
                      {car.transmission} • {car.fuelType}
                    </p>
                    {car.vin && <p className="text-xs">VIN: {car.vin}</p>}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(car)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(car._id!)}
                      className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? "No cars found" : "No cars yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "Try adjusting your search"
                : "Get started by adding your first vehicle"}
            </p>
            {!searchQuery && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Your First Car
              </button>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">
                {editingCar ? "Edit Car" : "Add New Car"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Make <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="e.g., Toyota"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="e.g., Camry"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numbers
                        if (/^[0-9]*$/.test(value)) {
                          setFormData((prev) => ({
                            ...prev,
                            year: value,
                          }));
                        }
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="e.g., 2023"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (CAD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numbers, commas, and periods
                        if (/^[0-9,.\s]*$/.test(value)) {
                          setFormData((prev) => ({
                            ...prev,
                            price: value,
                          }));
                        }
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="e.g., 25,000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mileage (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="mileage"
                      value={formData.mileage}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numbers, commas, and periods
                        if (/^[0-9,.\s]*$/.test(value)) {
                          setFormData((prev) => ({
                            ...prev,
                            mileage: value,
                          }));
                        }
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="e.g., 25,000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VIN
                    </label>
                    <input
                      type="text"
                      name="vin"
                      value={formData.vin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">
                  Vehicle Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transmission <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="Gasoline">Gasoline</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Body Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bodyType"
                      value={formData.bodyType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="e.g., Sedan, SUV, Truck"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="e.g., White, Black, Silver"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Add any additional details about the vehicle..."
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.coverImage && (
                  <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null; // prevent re-fire loop
                        e.currentTarget.style.display = "none";
                        e.currentTarget.alt = "Invalid image URL";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gallery Images (URLs)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addImageUrl())
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {formData.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img
                          src={imageUrl}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null; // prevent re-fire loop
                            e.currentTarget.style.display = "none";
                            e.currentTarget.alt = "Invalid URL";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                          {imageUrl}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addFeature())
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Add a feature and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingCar ? "Update Car" : "Add Car"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}