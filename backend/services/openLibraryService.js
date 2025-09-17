// Open Library API service for book enrichment
// Fetches additional book data: pages, cover image, publication year

const axios = require('axios');

class OpenLibraryService {
  constructor() {
    this.baseUrl = 'http://openlibrary.org';
    this.coversUrl = 'http://covers.openlibrary.org/b';
  }

  // Search for a book by title and author, prefer English results
  async searchBook(title, author) {
    try {
      // Clean and format the search query
      const query = `${title} ${author}`.replace(/[^\w\s]/g, '').trim();
      const searchUrl = `${this.baseUrl}/search.json?q=${encodeURIComponent(query)}&language=eng&limit=10`;

      const response = await axios.get(searchUrl, { timeout: 15000 });
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

  // Get fallback cover image and data based on title/author
  getFallbackData(title, author) {
    const titleLower = title.toLowerCase();
    const authorLower = author.toLowerCase();

    // Common book database with cover images
    const fallbackBooks = {
      'hobbit tolkien': { cover: '8566412', pages: 310, year: 1937 },
      'lord rings tolkien': { cover: '3132834', pages: 1216, year: 1954 },
      'great gatsby fitzgerald': { cover: '7222246', pages: 180, year: 1925 },
      'mockingbird harper lee': { cover: '2817620', pages: 324, year: 1960 },
      'kill mockingbird lee': { cover: '2817620', pages: 324, year: 1960 },
      'red rising pierce brown': { cover: '8509852', pages: 382, year: 2014 },
      'red rising brown': { cover: '8509852', pages: 382, year: 2014 },
      'lord flies william golding': { cover: '7984916', pages: 224, year: 1954 },
      'lord flies golding': { cover: '7984916', pages: 224, year: 1954 },
      'harry potter rowling': { cover: '6474129', pages: 309, year: 1997 },
      'harry potter jk rowling': { cover: '6474129', pages: 309, year: 1997 },
      'dune frank herbert': { cover: '93012', pages: 688, year: 1965 },
      'dune herbert': { cover: '93012', pages: 688, year: 1965 },
      'foundation isaac asimov': { cover: '6693811', pages: 244, year: 1951 },
      'foundation asimov': { cover: '6693811', pages: 244, year: 1951 },
      '1984 george orwell': { cover: '6998739', pages: 328, year: 1949 },
      '1984 orwell': { cover: '6998739', pages: 328, year: 1949 },
      'fahrenheit 451 ray bradbury': { cover: '7984091', pages: 158, year: 1953 },
      'fahrenheit bradbury': { cover: '7984091', pages: 158, year: 1953 },
      'brave new world aldous huxley': { cover: '3165019', pages: 268, year: 1932 },
      'brave new world huxley': { cover: '3165019', pages: 268, year: 1932 }
    };

    // Create search key
    const searchKey = `${titleLower} ${authorLower}`.replace(/[^\w\s]/g, '').trim();

    // Find best match
    for (const [key, data] of Object.entries(fallbackBooks)) {
      if (searchKey.includes(key.split(' ')[0]) && searchKey.includes(key.split(' ')[1])) {
        return {
          total_pages: data.pages,
          cover_image_url: `http://covers.openlibrary.org/b/id/${data.cover}-M.jpg`,
          publication_year: data.year
        };
      }
    }

    // Generic fallback - better default book cover
    return {
      total_pages: 250,
      cover_image_url: 'http://covers.openlibrary.org/b/id/8225261-M.jpg',
      publication_year: 2000
    };
  }

  // Enrich book data with additional information
  async enrichBook(title, author) {
    try {
      // Try API first with shorter timeout
      const bookData = await this.searchBook(title, author);

      if (bookData) {
        // Extract data from Open Library response
        const enrichment = {
          total_pages: bookData.number_of_pages_median || null,
          cover_image_url: null,
          publication_year: bookData.first_publish_year || null
        };

        // Get cover image if cover ID is available
        if (bookData.cover_i) {
          enrichment.cover_image_url = `http://covers.openlibrary.org/b/id/${bookData.cover_i}-M.jpg`;
        }

        return enrichment;
      }
    } catch (error) {
      console.error('Error enriching book data, using fallback:', error.message);
    }

    // Use fallback data when API fails
    return this.getFallbackData(title, author);
  }
}

module.exports = new OpenLibraryService();