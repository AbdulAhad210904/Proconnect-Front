"use client";

import { useState } from "react";
import Image from "next/image";
import { ProjectDetails } from "./ProjectDetails";
import { CircleCheck } from "lucide-react";

export function ProjectCard({ project }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <article className="flex flex-col p-6 w-full bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {project.alreadyApplied && (
        <div className="justify-items-end">
          {/*color green tick button*/}
          <CircleCheck size={24} className="text-green-500" />
        </div>
        )}
        <h3 className="text-lg font-bold mb-4">
          {project.title}
        </h3>
        
        {project.images?.length > 0 ? (
          <div className="flex gap-4 mb-6">
            {project.images.slice(0, 2).map((imageUrl, index) => (
              <div
                key={index}
                className="relative w-[120px] h-[120px] bg-gray-100 rounded-lg"
              >
                <Image
                  src={imageUrl}
                  alt={`Project image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative w-[120px] h-[120px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            <span>No Images</span>
          </div>
        )}


        <div className="space-y-2 mb-6">
          <div className="flex items-center">
            <span className="text-sm font-semibold w-24">Categorie:</span>
            <span className="text-sm text-gray-600">{project.category}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold w-24">Locatie:</span>
            <span className="text-sm text-gray-600">{project.location.city}, {project.location.country}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold w-24">Budget:</span>
            <span className="text-sm text-gray-600">{project.budget.currency} {project.budget.min}-{project.budget.max}</span>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(true)}
          className="w-full px-4 py-2 text-sm text-white bg-[#00A6E6] rounded-md hover:bg-[#0095d0] transition-colors"
        >
          Details bekijken
        </button>
      </article>

      {showDetails && (
        <ProjectDetails
          project={project}
          open={showDetails}
          onOpenChange={setShowDetails}
        />
      )}
    </>
  );
}