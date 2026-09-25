'use client';

import Image from "next/image";
import { useState, useCallback } from "react";
import { useCars } from "../context/CarsContext";

interface CarItem {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
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
}

const BRAND_BG = "#374151"; // grey background used in buttons
const BRAND_TEXT = "#1f2937"; // grey text color used in sections

function formatKm(value: number) {
  return new Intl.NumberFormat("fr-CA").format(value) + " km";
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTransmissionLabel(transmission: "Automatic" | "Manual") {
  return transmission === "Automatic" ? "Automatique" : "Manuelle";
}

function getFuelLabel(fuelType: "Gasoline" | "Diesel" | "Electric" | "Hybrid") {
  switch (fuelType) {
    case "Gasoline":
      return "Essence";
    case "Diesel":
      return "Diesel";
    case "Electric":
      return "Électrique";
    case "Hybrid":
      return "Hybride";
    default:
      return fuelType;
  }
}

function getStatusLabel(status: "available" | "sold" | "reserved") {
  switch (status) {
    case "available":
      return "Disponible";
    case "sold":
      return "Vendu";
    case "reserved":
      return "Réservé";
    default:
      return status;
  }
}

function getStatusColor(status: "available" | "sold" | "reserved") {
  switch (status) {
    case "available":
      return "#10B981"; // green
    case "sold":
      return "#EF4444"; // red
    case "reserved":
      return "#F59E0B"; // yellow
    default:
      return BRAND_BG;
  }
}

interface CarsProps {
  // No props needed
}

export default function Cars({}: CarsProps) {
  const { cars } = useCars();
  const [selectedCar, setSelectedCar] = useState<CarItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openCarModal = (car: CarItem) => {
    setSelectedCar(car);
    setCurrentImageIndex(0);
  };

  const closeCarModal = () => {
    setSelectedCar(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedCar) {
      const totalImages =
        selectedCar.images.length + (selectedCar.coverImage ? 1 : 0);
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    }
  };

  const prevImage = () => {
    if (selectedCar) {
      const totalImages =
        selectedCar.images.length + (selectedCar.coverImage ? 1 : 0);
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const getCurrentImage = () => {
    if (!selectedCar) return "/voitures/placeholder.svg";
    const allImages = selectedCar.coverImage
      ? [selectedCar.coverImage, ...selectedCar.images]
      : selectedCar.images;
    return allImages[currentImageIndex] || "/voitures/placeholder.svg";
  };

  const getTotalImages = () => {
    if (!selectedCar) return 0;
    return selectedCar.coverImage
      ? selectedCar.images.length + 1
      : selectedCar.images.length;
  };

  return (
    <section id="cars" className="pt-8 md:pt-26 pb-12 md:pb-16 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <h2
            className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide"
            style={{ color: BRAND_TEXT }}
          >
            Nos véhicules
          </h2>
          <a
            href="/contact"
            className="hidden md:inline-flex items-center justify-center h-11 px-6 rounded-full font-semibold text-white"
            style={{ backgroundColor: BRAND_BG }}
          >
            Nous vendre votre véhicule
          </a>
        </div>

        {cars.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">
              Aucun véhicule disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {cars.map((car) => (
              <article
                key={car._id}
                className="rounded-2xl border border-gray-300 bg-gray-50 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="relative w-full h-52 md:h-56">
                  <Image
                    src={
                      car.coverImage ||
                      car.images[0] ||
                      "/voitures/placeholder.svg"
                    }
                    alt={`${car.year} ${car.make} ${car.model}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                    className="object-cover"
                    priority={false}
                    onError={(e) => {
                      // Guard: never re-point at the placeholder, or a missing
                      // fallback would re-fire onError and loop infinitely.
                      if (e.currentTarget.src.includes("placeholder")) return;
                      e.currentTarget.src = "/voitures/placeholder.svg";
                    }}
                  />
                  <div
                    className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: getStatusColor(car.status) }}
                  >
                    {getStatusLabel(car.status)}
                  </div>
                </div>

                <div className="p-4 md:p-5">
                  <h3
                    className="text-base md:text-lg font-semibold"
                    style={{ color: BRAND_TEXT }}
                  >
                    {car.make} {car.model} · {car.year}
                  </h3>

                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                    <div>
                      <dt className="text-gray-500">Kilométrage</dt>
                      <dd className="font-medium text-gray-800">
                        {formatKm(car.mileage)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Transmission</dt>
                      <dd className="font-medium text-gray-800">
                        {getTransmissionLabel(car.transmission)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Carburant</dt>
                      <dd className="font-medium text-gray-800">
                        {getFuelLabel(car.fuelType)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Prix</dt>
                      <dd className="font-medium text-gray-800">
                        {formatPrice(car.price)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex items-center gap-3">
                    <button
                      onClick={() => openCarModal(car)}
                      className="inline-flex items-center justify-center h-10 px-5 rounded-full font-semibold text-white"
                      style={{ backgroundColor: BRAND_BG }}
                    >
                      Plus de détails
                    </button>
                    <a
                      href="tel:4389258315"
                      className="inline-flex items-center justify-center h-10 px-5 rounded-full border text-[#0E2C47]"
                      style={{ borderColor: BRAND_TEXT }}
                    >
                      Appeler
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal for detailed car information */}
      {selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start md:items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[calc(100vh-5rem)] md:max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {selectedCar.make} {selectedCar.model} {selectedCar.year}
                </h2>
                <button
                  onClick={closeCarModal}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="relative w-full h-48 md:h-64 mb-6">
                <Image
                  src={getCurrentImage()}
                  alt={`${selectedCar.year} ${selectedCar.make} ${selectedCar.model}`}
                  fill
                  className="object-cover rounded-lg"
                  onError={(e) => {
                    if (e.currentTarget.src.includes("placeholder")) return;
                    e.currentTarget.src = "/voitures/placeholder.svg";
                  }}
                />

                {getTotalImages() > 1 && (
                  <>
                    {/* Navigation buttons */}
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 md:p-2 rounded-full hover:bg-opacity-75 transition"
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 md:p-2 rounded-full hover:bg-opacity-75 transition"
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    {/* Image indicators */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 md:space-x-2">
                      {Array.from({ length: getTotalImages() }).map(
                        (_, index) => (
                          <button
                            key={index}
                            onClick={() => goToImage(index)}
                            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition ${
                              index === currentImageIndex
                                ? "bg-white"
                                : "bg-white bg-opacity-50"
                            }`}
                          />
                        )
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                    Informations principales
                  </h3>
                  <dl className="grid grid-cols-1 gap-2 md:gap-3">
                    <div>
                      <dt className="text-gray-500 text-sm">Prix</dt>
                      <dd className="font-medium text-gray-900">
                        {formatPrice(selectedCar.price)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 text-sm">Kilométrage</dt>
                      <dd className="font-medium text-gray-900">
                        {formatKm(selectedCar.mileage)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 text-sm">Transmission</dt>
                      <dd className="font-medium text-gray-900">
                        {getTransmissionLabel(selectedCar.transmission)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 text-sm">Carburant</dt>
                      <dd className="font-medium text-gray-900">
                        {getFuelLabel(selectedCar.fuelType)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                    Caractéristiques
                  </h3>
                  <dl className="grid grid-cols-1 gap-2 md:gap-3">
                    <div>
                      <dt className="text-gray-500 text-sm">
                        Type de carrosserie
                      </dt>
                      <dd className="font-medium text-gray-900">
                        {selectedCar.bodyType}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 text-sm">Couleur</dt>
                      <dd className="font-medium text-gray-900">
                        {selectedCar.color}
                      </dd>
                    </div>
                    {selectedCar.vin && (
                      <div>
                        <dt className="text-gray-500 text-sm">Numéro VIN</dt>
                        <dd className="font-medium text-gray-900">
                          {selectedCar.vin}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {selectedCar.description && (
                <div className="mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-semibold mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line text-sm md:text-base">
                    {selectedCar.description}
                  </p>
                </div>
              )}

              {selectedCar.features && selectedCar.features.length > 0 && (
                <div className="mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-semibold mb-2">
                    Équipements
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedCar.features.map((feature, index) => (
                      <li
                        key={index}
                        className="text-gray-700 flex items-center text-sm md:text-base"
                      >
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-500 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <a
                  href="/contact"
                  className="flex-1 inline-flex items-center justify-center h-11 px-6  py-4  rounded-full font-semibold text-white text-base"
                  style={{ backgroundColor: BRAND_BG }}
                >
                  Demander plus d'infos
                </a>
                <a
                  href="tel:4389258315"
                  className="flex-1 inline-flex items-center justify-center min-h-5 md:min-h-12 py-4 px-6 md:px-6 rounded-full border font-semibold text-[#0E2C47] text-sm md:text-base"
                  style={{ borderColor: BRAND_TEXT }}
                >
                  Appeler
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


