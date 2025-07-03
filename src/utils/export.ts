import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportCanvasAsPNG = (canvas: HTMLCanvasElement, filename: string = 'whiteboard.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL();
  link.click();
};

export const exportCanvasAsPDF = async (canvas: HTMLCanvasElement, filename: string = 'whiteboard.pdf') => {
  const pdf = new jsPDF('landscape');
  const imgData = canvas.toDataURL('image/png');
  
  const imgWidth = 297; // A4 landscape width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
};

export const exportCanvasAsJPEG = (canvas: HTMLCanvasElement, filename: string = 'whiteboard.jpg') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/jpeg', 0.9);
  link.click();
};