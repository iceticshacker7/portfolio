import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Certificate } from "@shared/schemas";
import { useApi } from "@/lib/api";
import { uniqueSorted } from "@/lib/content";
import { X, CheckCircle, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const ANY = "Any topic";

const ShimmerCard = () => (
  <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
);

const CertificateCard: React.FC<{
  certificate: Certificate;
  onClick: () => void;
}> = ({ certificate, onClick }) => {
  return (
    <Card
      className="w-full   shadow-lg overflow-hidden cursor-pointer transition-transform transform hover:scale-105 flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        {certificate.image ? (
          <img
            src={certificate.image}
            alt={`${certificate.title} Banner`}
            loading="lazy"
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100" />
        )}
      </div>
      <CardContent className="p-3 flex-grow">
        <h3 className="text-lg font-semibold mt-1 hover:underline cursor-pointer">
          {certificate.title}
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {certificate.tags.map((tech, index) => (
            <span key={index} className="text-xs text-blue-600">
              {tech}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600 line-clamp-4">
          {certificate.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center">
          <span className="text-sm font-medium">
            {certificate.instituteName}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

const CertificateDetail: React.FC<{
  certificate: Certificate;
  onClose: () => void;
}> = ({ certificate, onClose }) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-r from-blue-100 to-purple-100 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{certificate.title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="relative group">
            {certificate.image && <img
              src={certificate.image}
              alt={certificate.title}
              className="w-full h-48 object-contain bg-gray-50 rounded-lg mb-4"
            />}
            <button
              onClick={() => setIsImageExpanded(true)}
              aria-label="Expand image"
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            >
              <Maximize2 size={20} />
            </button>
          </div>
          <p className="text-gray-600 mb-4">{certificate.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {certificate.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          {certificate.date && <p className="text-sm text-gray-600 mb-2">Date: {certificate.date}</p>}
          <p className="text-sm text-gray-600 mb-2">
            Institute: {certificate.instituteName}
          </p>
          {certificate.location && <p className="text-sm text-gray-600 mb-4">
            Location: {certificate.location}
          </p>}
          {certificate.credentialUrl && <a
            href={certificate.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Verify Certificate</span>
          </a>}
        </div>
      </motion.div>
      <Dialog open={isImageExpanded} onOpenChange={setIsImageExpanded}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogTitle className="sr-only">{certificate.title}</DialogTitle>
          <img
            src={certificate.image}
            alt={certificate.title}
            className="w-full h-auto object-contain"
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default function CertificatesSection() {
  const { data: certificates, loading, error } = useApi<Certificate[]>("/certificates", []);
  const [activeTag, setActiveTag] = useState(ANY);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const allTags = [ANY, ...uniqueSorted(certificates.flatMap((c) => c.tags))];

  const filteredCertificates =
    activeTag === ANY
      ? certificates
      : certificates.filter((certificate) =>
          certificate.tags.includes(activeTag)
        );

  return (
    <div className="py-12 px-4 sm:px-8 bg-gradient-to-br from-white to-gray-50 font-mono">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-2 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Explore my Certificates
        </motion.h2>
        <motion.p 
          className="text-gray-600 mb-8 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Explore my collection of certificates and certifications, showcasing my expertise in various domains.
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {allTags.map((tag) => (
            <motion.button
              key={tag}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeTag === tag
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTag(tag)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tag}
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={`shimmer-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ShimmerCard />
                  </motion.div>
                ))
              : filteredCertificates.map((certificate) => (
                  <motion.div
                    key={certificate.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CertificateCard
                      certificate={certificate}
                      onClick={() => setSelectedCertificate(certificate)}
                    />
                  </motion.div>
                ))}
          </AnimatePresence>
        </motion.div>
        {!loading && filteredCertificates.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            {error ? "Could not load certificates right now. Please try again later." : "No certificates in this category yet."}
          </p>
        )}
      </div>
      <AnimatePresence>
        {selectedCertificate && (
          <CertificateDetail
            certificate={selectedCertificate}
            onClose={() => setSelectedCertificate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}