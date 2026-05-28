import React from 'react';

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Contact Us
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Get in touch with our team for any inquiries.
          </p>
        </div>
        <div className="mt-10 max-w-lg mx-auto">
          {/* Placeholder for contact form */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
            Contact form coming soon.
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
