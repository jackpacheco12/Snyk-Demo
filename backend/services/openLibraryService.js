// Open Library API service for book enrichment
// Fetches additional book data: pages, cover image, publication year

const axios = require('axios');

class OpenLibraryService {
  constructor() {
    this.baseUrl = 'https://openlibrary.org';
    this.coversUrl = 'https://covers.openlibrary.org/b';
  }

  // Search for a book by title and author, prefer English results
  async searchBook(title, author) {
    try {
      // Clean and format the search query
      const query = `${title} ${author}`.replace(/[^\w\s]/g, '').trim();
      const searchUrl = `${this.baseUrl}/search.json?q=${encodeURIComponent(query)}&language=eng&limit=10`;

      const response = await axios.get(searchUrl, { timeout: 5000 });
      const books = response.data.docs;

      if (books && books.length > 0) {
        // Enhanced English book filtering
        const englishBooks = books.filter(book => {
          // Check language field
          const hasEnglishLanguage = !book.language ||
            book.language.includes('eng') ||
            book.language.includes('en');

          // Check if title contains mostly English characters (basic check)
          const titleIsEnglish = !book.title || /^[a-zA-Z0-9\s\-\.\,\:\;\!\?\'\"\(\)]+$/.test(book.title);

          // Prefer books published in English-speaking countries
          const englishPublishers = ['United States', 'United Kingdom', 'Canada', 'Australia'];
          const hasEnglishPublisher = !book.publish_place ||
            englishPublishers.some(country =>
              book.publish_place.some && book.publish_place.some(place =>
                place.includes(country)
              )
            );

          return hasEnglishLanguage && titleIsEnglish;
        });

        // Return the first English book, or first book if no English books found
        return englishBooks.length > 0 ? englishBooks[0] : books[0];
      }

      return null;
    } catch (error) {
      console.error('Error searching Open Library:', error.message);
      return null;
    }
  }

  // Enrich book data with additional information
  async enrichBook(title, author) {
    try {
      const bookData = await this.searchBook(title, author);

      if (!bookData) {
        return {
          total_pages: null,
          cover_image_url: null,
          publication_year: null
        };
      }

      // Extract data from Open Library response
      const enrichment = {
        total_pages: bookData.number_of_pages_median || null,
        cover_image_url: null,
        publication_year: bookData.first_publish_year || null
      };

      // Get cover image if cover ID is available
      if (bookData.cover_i) {
        // Use HTTP instead of HTTPS to avoid mixed content issues when served over HTTP
        enrichment.cover_image_url = `http://covers.openlibrary.org/b/id/${bookData.cover_i}-M.jpg`;
      }

      return enrichment;
    } catch (error) {
      console.error('Error enriching book data:', error.message);
      return {
        total_pages: null,
        cover_image_url: null,
        publication_year: null
      };
    }
  }
}

module.exports = new OpenLibraryService();