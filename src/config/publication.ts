// Official ISBN registration, transcribed from the Acknowledgement Slip issued by
// the Raja Rammohun Roy National Agency for ISBN (RRRNA), Government of India.
// Source images: public/isbn/acknowledgement.jpg and public/isbn/barcode.png.
export const publication = {
  isbn: '978-93-345-2761-2',
  bookTitle: 'Arjuna Book of World Record',
  publisher: 'Shiniy Sports Zone',
  author: 'Geetha',
  language: 'Tamil',
  format: 'Single-component retail product (Book)',
  year: 2026,
  allottedDate: '2026-09-26',
  referenceNo: '45938|ISBN|2026|A',
  issuedBy: 'Raja Rammohun Roy National Agency for ISBN (RRRNA)',
  issuerDepartment: 'Department of Higher Education, Ministry of Education, Government of India',
  issuerWebsite: 'https://isbn.gov.in',
  images: {
    barcode: '/isbn/barcode.png',
    acknowledgement: '/isbn/acknowledgement.webp',
    acknowledgementFull: '/isbn/acknowledgement.jpg',
  },
} as const

/** schema.org Book entry for search engines. */
export const publicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: publication.bookTitle,
  isbn: publication.isbn,
  author: { '@type': 'Person', name: publication.author },
  publisher: { '@type': 'Organization', name: publication.publisher },
  inLanguage: 'ta',
  datePublished: String(publication.year),
  bookFormat: 'https://schema.org/Paperback',
}
