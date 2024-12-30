"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { ProjectCard } from "./ProjectCard";
import { fetchCraftsmanViewProjects } from "@/store/posted-projects/projectThunk";
import { Loader } from 'lucide-react';

export function ProjectBrowser() {
  const dispatch = useDispatch();
  const { craftsmanProjects, loading, error } = useSelector((state) => state.projects);

  const [filters, setFilters] = useState({
    category: "",
    location: "",
    budget: "",
    date: "",
    search: "",
  });

  useEffect(() => {
    dispatch(fetchCraftsmanViewProjects(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange("search", filters.search);
  };

  const filteredProjects = useMemo(() => {
    return craftsmanProjects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                            project.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = !filters.category || project.category.toLowerCase() === filters.category.toLowerCase();
      
      const matchesLocation = !filters.location || 
                              project.location.country.toLowerCase() === filters.location.toLowerCase();
      
      const matchesBudget = !filters.budget || (() => {
        const [min, max] = filters.budget.split('-').map(Number);
        if (max) {
          return project.budget.min >= min && project.budget.min <= max;
        } else {
          return project.budget.min >= min;
        }
      })();
      
      const matchesDate = !filters.date || new Date(project.deadline) >= new Date(filters.date);

      return matchesSearch && matchesCategory && matchesLocation && matchesBudget && matchesDate;
    });
  }, [craftsmanProjects, filters]);

  return (
    <main className="flex overflow-hidden flex-col items-center bg-white">
      <header className="relative flex flex-col items-center self-stretch pb-8 w-full text-white bg-[#27aae2] overflow-hidden max-md:max-w-full">
        {/* Background circles */}
        <div className="hidden xl:flex absolute left-0 top-[27%] -translate-y-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[1250px] max-h-[1250px] rounded-full bg-black/10 z-0" />
        <div className="hidden xl:flex absolute right-[-30%] bottom-[-155%] w-[80vw] h-[80vw] max-w-[1250px] max-h-[1250px] rounded-full bg-black/10 z-0" />

        {/* Content */}
        <div className="relative z-10 w-full px-4 max-w-6xl">
          <h2 className="mt-12 text-2xl font-semibold text-center max-md:mt-6 max-md:max-w-full max-sm:text-lg max-sm:mt-4">
            Browse through available projects
          </h2>
          <p className="mt-4 text-base font-light text-center max-md:max-w-full max-sm:text-sm max-sm:mt-2">
            Find the right projects and start working today.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex justify-center mt-8 max-w-full w-full px-4 md:w-[400px] mx-auto max-md:mt-6 max-sm:flex-col max-sm:gap-3">
            <label htmlFor="searchProjects" className="sr-only">
              Search projects
            </label>
            <input
              type="search"
              id="searchProjects"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="grow px-4 py-2 bg-white rounded-l-lg w-full text-sm font-light text-black text-opacity-60 max-sm:rounded-lg max-sm:px-3"
            />
            <button
              type="submit"
              className="flex shrink-0 h-10 bg-sky-500 rounded-r-lg w-[50px] max-sm:rounded-lg max-sm:w-full"
              aria-label="Search"
            >
              <Image
                src="/icons/search-icon.svg"
                width={20}
                height={20}
                alt=""
                className="m-auto"
              />
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 justify-between mt-8 w-full text-sm font-light whitespace-nowrap max-w-[900px] mx-auto max-md:mt-6 max-md:max-w-full max-sm:justify-center">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="py-1 px-3 rounded-md border border-white border-solid max-sm:px-2 max-sm:text-xs bg-transparent text-white"
            >
              <option value="" className="bg-white text-[#00A6E6]">Category</option>
              <option value="electrical" className="bg-white text-[#00A6E6] hover:bg-[#00A6E6] hover:text-white">Electrical</option>
              <option value="plumbing" className="bg-white text-[#00A6E6] hover:bg-[#00A6E6] hover:text-white">Plumbing</option>
              <option value="construction" className="bg-white text-[#00A6E6] hover:bg-[#00A6E6] hover:text-white">Construction</option>
              <option value="painting" className="bg-white text-[#00A6E6] hover:bg-[#00A6E6] hover:text-white">Painting</option>
              <option value="gardening" className="bg-white text-[#00A6E6] hover:bg-[#00A6E6] hover:text-white">Gardening</option>
            </select>

            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="py-1 px-3 rounded-md border border-white border-solid max-sm:px-2 max-sm:text-xs bg-transparent text-white"
            >
              <option value="" className="bg-white text-[#00A6E6]">Location</option>
              <option value="USA" className="bg-white text-[#00A6E6] hover:bg-[#00A6E6] hover:text-white">USA</option>
              <option value="Belgium" className="bg-white text-[#00A6E6] hover:bg-[#00A6E6] hover:text-white">Belgium</option>
              <option value="Pakistan" className="bg-white text-[#00A6E6] hover:bg-[#00A6E6] hover:text-white">Pakistan</option>
            </select>

            <select
              value={filters.budget}
              onChange={(e) => handleFilterChange("budget", e.target.value)}
              className="py-1 px-3 rounded-md border border-white border-solid max-sm:px-2 max-sm:text-xs bg-transparent text-white"
            >
              <option value="" className="bg-white text-[#00A6E6]">Budget</option>
              <option value="0-1000" className="bg-white text-[#00A6E6] hover:bg-[#00A6E6] hover:text-white">$0 - $1,000</option>
              <option value="1000-5000" className="bg-white text-[#00A6E6] hover:bg-[#00A6E6] hover:text-white">$1,000 - $5,000</option>
              <option value="5000+" className="bg-white text-[#00A6E6] hover:bg-[#00A6E6] hover:text-white">$5,000+</option>
            </select>

            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="py-1 px-3 rounded-md border border-white border-solid max-sm:px-2 max-sm:text-xs bg-transparent text-white"
            />
          </div>
        </div>
      </header>

      <section className="mt-32 mb-10 w-full max-w-[1261px] max-md:mt-10 max-md:mb-6 max-md:max-w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin" size={48} color="#00A6E6" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
            {filteredProjects.length === 0 ? (
              <div className="col-span-2 text-center text-lg font-semibold text-gray-500">
                No projects found.
              </div>
            ) : (
              filteredProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}