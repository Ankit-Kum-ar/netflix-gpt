import React, { useRef } from 'react'
import { genAI } from '../Helpers/GeminiAi';
import { API_OPTIONS } from '../utils/constant';
import { useDispatch } from 'react-redux';
import { addGeminiMovies } from '../redux/Slices/geminiSlice';

const GeminiBar = () => {
  const inputText = useRef();

  const extractArray = (geminiMovies) => {
    // Removing '/n' from array.
    const lastIndex = geminiMovies.length - 1;
    geminiMovies[lastIndex] = geminiMovies[lastIndex].replace(/\n/g, "");
    return geminiMovies;
  }

  const searchTMDBMovies = async(movie) => {
    const response = await fetch('https://api.themoviedb.org/3/search/movie?query='+movie+'&include_adult=true&language=en-US&page=1', API_OPTIONS)
    const data = await response.json();
    return data?.results;
  }
  
  const dispatch = useDispatch();

  const handleButton = async() => {
    const prompt = 
      "Act as a Movie Recommendation System and suggest some movie names for the query: " +
      inputText.current.value +
      ". Generagte 3 movies name that separated by commas without full stop include in any name."

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Convert text into string Array...
      const geminiMovies = text.split(",");
      console.log(geminiMovies);
      const searchMovies = extractArray(geminiMovies);
      console.log(searchMovies);
      console.log(Array.isArray(searchMovies));

      // For each movie i have to call the searchTMDBMovie function.
      const dataMovies =  searchMovies.map((movie) => searchTMDBMovies(movie));
      console.log(dataMovies); // The dataMovies hold the six promises, bcz it is async function.

      // To resolve the promises, we have to use Promise.all() method.
      const movies = await Promise.all(dataMovies);
      console.log(movies); // The movies array hold the six arrays of movies.

      // Now we have to merge all the arrays into a single array.
      const mergedMovies = movies.flat();
      console.log(mergedMovies); // The mergedMovies array hold the all the movies.

      // Now we have to filter the movies array, to get only english and hindi movies.
      const filterMovies = mergedMovies.filter((movie) => (
        movie.original_language === "en" || movie.original_language === "hi"
      ))
      console.log(filterMovies); // The filterMovies array hold the all the english and hindi movies.

      // Now we have to dispatch the mergedMovies to the store.
      dispatch(addGeminiMovies(filterMovies));
  }

  return (
    <div className='flex justify-center  items-center pt-[14%]'>
        <form action="" className='bg-black w-1/2 rounded-2xl' onSubmit={(e) => e.preventDefault()}>
        <input 
            className='placeholder-black p-3 m-4 w-8/12 outline-none rounded-xl ' 
            type="text" 
            placeholder="Search for a movie" 
            ref={inputText}
        />
        <button 
            className='bg-red-800 text-white px-4 py-2.5 w-3/12 rounded-xl' 
            onClick={handleButton}>
            Search
        </button>
        </form>
    </div>
  )
}

export default GeminiBar
