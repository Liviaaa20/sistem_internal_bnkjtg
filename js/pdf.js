function downloadPDF() {
    const element = document.getElementById("brosurArea");
    
    // 1. Tambahkan class khusus PDF
    element.classList.add('pdf-mode');

    const opt = {
        margin: 0,
        filename: 'Simulasi-Deposito-BankJateng-2025.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            width: 794,
            height: 1122
        },
        jsPDF: { 
            unit: 'px', 
            format: [794, 1122], 
            orientation: 'portrait' 
        }
    };

    // 2. Gunakan html2pdf dengan delay sedikit
    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
        // Hapus class setelah selesai agar tampilan web balik normal
        element.classList.remove('pdf-mode');
    }).save();
}