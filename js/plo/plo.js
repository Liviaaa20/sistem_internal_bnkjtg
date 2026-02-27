// 1. FORMATTING TOOLS
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID').format(Math.round(angka));
}

// Auto format ribuan saat ketik
document.getElementById("pinjaman").addEventListener("input", function(e) {
    let value = e.target.value.replace(/\D/g, "");
    e.target.value = formatRupiah(value);
});

// 2. GLOBAL SETTINGS
let bungaGlobal = 8;
let metodeGlobal = "anuitas";
let showAllGlobal = false;

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

// 3. MATH LOGIC
function hitungFlat(pinjaman, bungaTahunan, tahun) {
    let bungaBulanan = (pinjaman * (bungaTahunan / 100)) / 12;
    let pokokBulanan = pinjaman / (tahun * 12);
    return pokokBulanan + bungaBulanan;
}

function hitungAnuitas(pinjaman, bungaTahunan, tahun) {
    let r = (bungaTahunan / 100) / 12;
    let n = tahun * 12;
    if (r === 0) return pinjaman / n;
    return pinjaman * r / (1 - Math.pow(1 + r, -n));
}

// 4. MAIN SIMULATION ENGINE
function hitungKPR() {
    let nominalInput = document.getElementById("pinjaman").value.replace(/\./g, "");
    let nominalAwal = parseInt(nominalInput);
    
    if (!nominalAwal || nominalAwal < 15000000) {
        Toast.fire({ icon: 'warning', title: 'Minimal pinjaman Rp 15.000.000' });
        return;
    }

    if (nominalAwal > 1500000000) {
        Toast.fire({ icon: 'error', title: 'Limit maksimal Rp 1.500.000.000' });
        return;
    }

    // --- LOGIKA KELIPATAN DINAMIS (LIMIT 1.5M) ---
    let daftarNominal = [];
    let tempNominal = nominalAwal;

    while (tempNominal <= 1500000000) {
        daftarNominal.push(tempNominal);

        let kenaikan = 0;
        if (tempNominal < 100000000) {
            kenaikan = 10000000;  // 10jt
        } else if (tempNominal < 500000000) {
            kenaikan = 75000000;  // 75jt
        } else if (tempNominal < 1000000000) {
            kenaikan = 100000000; // 100jt
        } else if (tempNominal < 1500000000) {
            kenaikan = 250000000; // 250jt
        } else {
            break; 
        }

        tempNominal += kenaikan;
        if (tempNominal > 1500000000) break;
    }

    // --- RENDER TABLE ---
    let header = document.getElementById("headerTenor");
    let tbody = document.getElementById("tabelHasilKPR");
    
    tbody.innerHTML = "";
    header.innerHTML = `<th class="py-4 px-4 font-bold">Plafond</th>`;

    // Render Header Tenor
    for (let tahun = 1; tahun <= 20; tahun++) {
        if (!showAllGlobal && tahun < 5) continue;
        let isHighlight = (tahun % 5 === 0);
        header.innerHTML += `<th class="py-4 px-2 text-center ${isHighlight ? 'bg-blue-800' : ''}">${tahun} Th</th>`;
    }

    // Render Rows
    daftarNominal.forEach(nominal => {
        let row = `<tr class="group hover:bg-blue-50 transition-colors">
            <td class="py-4 px-4 border-b border-slate-100 font-bold text-slate-800">
                ${formatRupiah(nominal)}
            </td>`;

        for (let tahun = 1; tahun <= 20; tahun++) {
            if (!showAllGlobal && tahun < 5) continue;

            let cicilan = metodeGlobal === "flat" 
                ? hitungFlat(nominal, bungaGlobal, tahun) 
                : hitungAnuitas(nominal, bungaGlobal, tahun);

            let isHighlight = (tahun % 5 === 0);
            row += `<td class="py-4 px-2 border-b border-slate-100 text-center font-semibold text-slate-600 ${isHighlight ? 'bg-blue-50/50' : ''}">
                ${formatRupiah(cicilan)}
            </td>`;
        }
        row += `</tr>`;
        tbody.innerHTML += row;
    });

    document.getElementById("hasilSectionKPR").classList.remove("hidden");
    document.getElementById("metodeLabel").innerText = `Metode ${metodeGlobal.toUpperCase()} - Bunga ${bungaGlobal}%`;
}

// 5. MODAL CONTROLS (FILTER & CONTACT)
function openFilter() {
    document.getElementById("filterModal").classList.remove("hidden");
    document.getElementById("filterModal").classList.add("flex");
}

function closeFilter() {
    // 1. Ambil nilai terbaru dari input modal
    bungaGlobal = parseFloat(document.getElementById("filterBunga").value) || 8;
    metodeGlobal = document.getElementById("filterMetode").value;
    
    // 2. Ambil nilai checkbox (Ini yang membuat tenor 1-4 muncul/sembunyi)
    showAllGlobal = document.getElementById("filterToggle").checked; 

    // 3. Tutup Modal
    document.getElementById("filterModal").classList.add("hidden");
    document.getElementById("filterModal").classList.remove("flex");
    
    // 4. Update tampilan teks bunga di brosur
    document.getElementById("metodeLabel").innerText = `Metode ${metodeGlobal.toUpperCase()} - Bunga ${bungaGlobal}%`;

    // 5. Jalankan ulang hitungKPR jika tabel sedang tampil
    if (!document.getElementById("hasilSectionKPR").classList.contains("hidden")) {
        hitungKPR();
    }
}

// Fitur Contact Person (Bisa di-copy dari Deposito kalau mau modal input)
function openContactModal() {
    Swal.fire({
        title: 'Edit Kontak Petugas',
        html: `
            <input id="swal-nama" class="swal2-input" placeholder="Nama" value="${document.getElementById('cpNama').innerText}">
            <input id="swal-phone" class="swal2-input" placeholder="Nomor HP" value="${document.getElementById('cpPhone').innerText}">
        `,
        focusConfirm: false,
        preConfirm: () => {
            return [
                document.getElementById('swal-nama').value,
                document.getElementById('swal-phone').value
            ]
        }
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('cpNama').innerText = result.value[0].toUpperCase();
            document.getElementById('cpPhone').innerText = result.value[1];
        }
    })
}

// 6. PDF DOWNLOAD FEATURE
function downloadPDF() {
    const element = document.getElementById('brosurArea');
    const opt = {
        margin: 0,
        filename: 'Simulasi_KPR_BankJateng.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    Toast.fire({ icon: 'info', title: 'Sedang menyiapkan PDF...' });
    html2pdf().set(opt).from(element).save();
}