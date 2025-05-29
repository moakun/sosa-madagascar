"use client";

import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/components/Certificate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Loader2 } from "lucide-react";

export default function Attestation() {
  const { data: session } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (!certificateRef.current || !session?.user?.email) return;

    setIsGenerating(true);
    try {
      // Generate certificate image with optimized settings
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
        // Remove fixed width/height to capture actual element size
        allowTaint: true,
        removeContainer: true,
        imageTimeout: 15000,
        // Ensure we capture the full element
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: false
      });

      // Method 1: Optimized PNG with compression
      const imgData = canvas.toDataURL("image/png", 0.8); // 80% quality
      
      // Method 2: Alternative - Use JPEG for smaller size (if quality is acceptable)
      // const imgData = canvas.toDataURL("image/jpeg", 0.85); // 85% quality JPEG

      // Create PDF with optimized settings
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true // Enable PDF compression
      });

      // Calculate dimensions to fit the entire certificate with proper margins
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 297mm for A4 landscape
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 210mm for A4 landscape
      
      // Add margins (10mm on each side)
      const margin = 10;
      const availableWidth = pdfWidth - (2 * margin);
      const availableHeight = pdfHeight - (2 * margin);
      
      // Calculate aspect ratios
      const canvasRatio = canvas.width / canvas.height;
      const availableRatio = availableWidth / availableHeight;
      
      let imgWidth, imgHeight, x, y;
      
      if (canvasRatio > availableRatio) {
        // Canvas is wider than available space - fit to width
        imgWidth = availableWidth;
        imgHeight = availableWidth / canvasRatio;
        x = margin;
        y = margin + (availableHeight - imgHeight) / 2; // Center vertically
      } else {
        // Canvas is taller than available space - fit to height
        imgHeight = availableHeight;
        imgWidth = availableHeight * canvasRatio;
        x = margin + (availableWidth - imgWidth) / 2; // Center horizontally
        y = margin;
      }

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight, undefined, 'FAST');
      
      // Save with compression
      pdf.save("certificat.pdf");

      // Update attestation status
      const response = await fetch("/api/certinfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email
        }),
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour dans la base de données");
      }

    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Veuillez vous connecter pour voir votre certificat.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-screen-lg mx-auto space-y-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Certificat</h1>
          <Button onClick={downloadCertificate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Télécharger le certificat"
            )}
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-auto">
            <div ref={certificateRef}>
              <Certificate
                userName={session.user?.fullName || "Participant"}
                company={session.user?.companyName || "Entreprise"}
                date={new Date()}
                courseName="Formation Anti-corruption"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}