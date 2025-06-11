// pdfGenerator.js
// PDF Generation Utility for Agreement Document

/**
 * Generate and download PDF for agreement document
 * @param {Object} agreementData - Agreement data containing name, designation, signature URL, date
 */
export const generateAgreementPDF = async (agreementData) => {
    try {
        // Import jsPDF dynamically
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        // Set default font
        doc.setFont('helvetica');

        // Document Title
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text('INTERNSHIP AGREEMENT AND NON-DISCLOSURE AGREEMENT (NDA)', 20, 20);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('This Agreement is made and entered into as of 06/10/2025', 20, 35);

        let yPosition = 50;

        // Helper function to add sections to PDF
        const addSection = (title, content, isLast = false) => {
            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            // Section title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(title, 20, yPosition);
            yPosition += 10;
            
            // Section content
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            
            if (Array.isArray(content)) {
                // Handle bullet points
                content.forEach(item => {
                    const lines = doc.splitTextToSize(`• ${item}`, 170);
                    lines.forEach(line => {
                        if (yPosition > 280) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        doc.text(line, 25, yPosition);
                        yPosition += 5;
                    });
                });
            } else {
                // Handle paragraph content
                const lines = doc.splitTextToSize(content, 170);
                lines.forEach(line => {
                    if (yPosition > 280) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(line, 20, yPosition);
                    yPosition += 5;
                });
            }
            yPosition += 5;
        };

        // Add all agreement sections
        addSection(
            '1. INTERNS DETAILS', 
            'This section outlines the intern\'s basic information and agreement to the terms below.'
        );
        
        addSection(
            '1.1 Position', 
            'Intern agrees to participate in a 3-month, unpaid internship program in the domain of Python, Artificial Intelligence, Machine Learning, and Deep Learning.'
        );
        
        addSection(
            '1.2 Duration', 
            'Start Date: [Start Date]\nEnd Date: [End Date]\nThe internship lasts exactly 3 months unless terminated earlier.'
        );
        
        addSection(
            '1.3 Nature of Internship', 
            'This internship is strictly educational and unpaid. No employer-employee relationship exists. The purpose is skill enhancement, practical exposure, and learning through real-world projects.'
        );
        
        addSection('2. DUTIES AND EXPECTATIONS', [
            'Contribute to live and internal projects involving Python, AI/ML/DL.',
            'Attend virtual meetings, submit tasks, and participate in reviews.',
            'Maintain professional conduct and confidentiality.',
            'Weekly progress updates and final submission are mandatory.'
        ]);
        
        addSection('3. BENEFITS TO INTERN', [
            'Upon successful completion, the intern will receive:',
            'Internship Certificate',
            'Letter of Recommendation (subject to performance)',
            'Letter of Experience',
            'Job Offer Opportunity (only if performance is exceptional)'
        ]);
        
        addSection(
            '4. NON-DISCLOSURE AGREEMENT (NDA)', 
            'The following terms govern confidentiality and intellectual property rights.'
        );
        
        addSection('4.1 Confidential Information', [
            'Intern agrees not to disclose any proprietary, confidential, or sensitive data related to:',
            'Codebase, source files, algorithms, datasets',
            'Research methodologies or tech architecture',
            'Any unpublished projects or business strategies',
            'Client information or third-party tools used'
        ]);
        
        addSection(
            '4.2 Ownership', 
            'All work, code, inventions, designs, and intellectual property created during the internship shall be the exclusive property of the Company.'
        );
        
        addSection(
            '4.3 Non-Use and Non-Disclosure', 
            'Intern shall not use Confidential Information for personal benefit or disclose it to third parties. This clause survives even after the termination of the internship.'
        );
        
        addSection('5. TERMINATION', [
            'This Agreement may be terminated:',
            'By either party with 7 days\' written notice.',
            'Immediately by the Company for misconduct, violation of confidentiality, or failure to perform.',
            'Upon intern\'s request due to academic/emergency obligations (subject to formal notice).'
        ]);
        
        addSection(
            '6. NO COMPENSATION', 
            'The Intern understands and agrees that this internship is voluntary and unpaid. No wages, stipends, or financial compensation shall be provided during the 3-month internship period, except for potential performance-based rewards that may be granted at the sole discretion of the Company in recognition of exceptional contributions.'
        );
        
        addSection(
            '7. GOVERNING LAW', 
            'This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes shall be resolved in courts located in [Your Jurisdiction – e.g., Delhi].'
        );
        
        addSection(
            '8. ENTIRE AGREEMENT', 
            'This document constitutes the complete agreement between the parties. Any amendments must be in writing and signed by both parties.'
        );

        // Add signature section
        if (yPosition > 200) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('9. SIGNATURES', 20, yPosition);
        yPosition += 15;
        
        doc.text('Company Representative:', 20, yPosition);
        yPosition += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Name: ${agreementData.name || 'Not Provided'}`, 20, yPosition);
        yPosition += 8;
        doc.text(`Designation: ${agreementData.designation || 'Not Provided'}`, 20, yPosition);
        yPosition += 8;
        doc.text('Signature:', 20, yPosition);
        yPosition += 8;

        // Add signature image if available
        if (agreementData.signatureURL) {
            try {
                await addSignatureImage(doc, agreementData.signatureURL, 20, yPosition);
                yPosition += 25;
            } catch (error) {
                console.error('Error adding signature to PDF:', error);
                doc.text('[Signature Image - Error Loading]', 20, yPosition);
                yPosition += 10;
            }
        } else {
            doc.text('[No Signature Provided]', 20, yPosition);
            yPosition += 10;
        }

        // Format and add date
        const displayDate = formatDateForPDF(agreementData.date);
        doc.text(`Date: ${displayDate}`, 20, yPosition);

        // Add footer
        addFooter(doc);

        // Save the PDF
        doc.save('agreement.pdf');
        
        console.log('PDF generated successfully');
        return true;
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF: ' + error.message);
    }
};

/**
 * Add signature image to PDF
 * @param {jsPDF} doc - PDF document instance
 * @param {string} signatureURL - URL of signature image
 * @param {number} x - X position
 * @param {number} y - Y position
 */
const addSignatureImage = async (doc, signatureURL, x, y) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas dimensions
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image on canvas
                ctx.drawImage(img, 0, 0);
                
                // Convert to base64
                const imgData = canvas.toDataURL('image/png');
                
                // Add image to PDF (width: 50, height: 20)
                doc.addImage(imgData, 'PNG', x, y, 50, 20);
                
                resolve();
            } catch (error) {
                console.error('Error processing signature image:', error);
                reject(error);
            }
        };
        
        img.onerror = (error) => {
            console.error('Error loading signature image:', error);
            reject(new Error('Failed to load signature image'));
        };
        
        // Load image
        img.src = signatureURL;
    });
};

/**
 * Format date for PDF display
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
const formatDateForPDF = (dateStr) => {
    try {
        if (!dateStr) return '06/10/2025';
        
        // If date is base64 encoded, decode it
        if (isBase64(dateStr)) {
            return atob(dateStr);
        }
        
        return dateStr;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '06/10/2025';
    }
};

/**
 * Check if string is base64 encoded
 * @param {string} str - String to check
 * @returns {boolean} True if base64
 */
const isBase64 = (str) => {
    try {
        return btoa(atob(str)) === str;
    } catch (err) {
        return false;
    }
};

/**
 * Add footer to PDF
 * @param {jsPDF} doc - PDF document instance
 */
const addFooter = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Page ${i} of ${pageCount} - Internship Agreement & NDA`, 
            20, 
            doc.internal.pageSize.height - 10
        );
        doc.text(
            `Generated on: ${new Date().toLocaleDateString()}`,
            doc.internal.pageSize.width - 80,
            doc.internal.pageSize.height - 10
        );
    }
};

/**
 * Validate agreement data before PDF generation
 * @param {Object} data - Agreement data
 * @returns {boolean} True if valid
 */
export const validateAgreementData = (data) => {
    const requiredFields = ['name', 'designation', 'date'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        console.warn('Missing required fields:', missingFields);
        return false;
    }
    
    return true;
};

/**
 * Generate PDF with error handling
 * @param {Object} agreementData - Agreement data
 * @returns {Promise<boolean>} Success status
 */
export const generatePDFSafely = async (agreementData) => {
    try {
        // Validate data
        if (!validateAgreementData(agreementData)) {
            throw new Error('Invalid agreement data provided');
        }
        
        // Generate PDF
        await generateAgreementPDF(agreementData);
        return true;
        
    } catch (error) {
        console.error('PDF generation failed:', error);
        
        // Fallback: Generate basic PDF without signature image
        try {
            console.log('Attempting fallback PDF generation...');
            const fallbackData = {
                ...agreementData,
                signatureURL: null // Remove signature URL to avoid image loading issues
            };
            await generateAgreementPDF(fallbackData);
            console.log('Fallback PDF generated successfully');
            return true;
        } catch (fallbackError) {
            console.error('Fallback PDF generation also failed:', fallbackError);
            alert('Error generating PDF. Please try again or contact support.');
            return false;
        }
    }
};

// Export default function
export default generateAgreementPDF;