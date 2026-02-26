function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID").format(angka);
}

document.getElementById("nominal").addEventListener("input", function(e) {
    let value = e.target.value.replace(/\D/g, "");
    e.target.value = formatRupiah(value);
});

function hitungDeposito() {

    let nominalInput = document.getElementById("nominal").value.replace(/\./g, "");
    let nominalAwal = parseInt(nominalInput);

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

if (!nominalAwal || nominalAwal < 5000000) {
    Toast.fire({
      icon: 'warning',
      title: 'Minimal nominal Rp 5.000.000',
      background: '#fff',
      color: '#1e293b'
    });
    return;
}

    let tbody = document.getElementById("tabelHasil");
    tbody.innerHTML = "";

    let daftarNominal = [];

    // Kelipatan 5jt sampai 35jt
    for (let i = nominalAwal; i <= 35000000; i += 5000000) {
        daftarNominal.push(i);
    }

    // Tambahan khusus
    daftarNominal.push(50000000);
    daftarNominal.push(75000000);
    daftarNominal.push(100000000);

    daftarNominal.forEach(nominal => {

    let kolom3 = hitungAkumulasi(nominal, 3, rate3Global);
    let kolom6 = hitungAkumulasi(nominal, 6, rate6Global);
    let kolom12 = hitungAkumulasi(nominal, 12, rate12Global);

// Di dalam loop daftarNominal.forEach pada kalkulasi.js
tbody.innerHTML += `
    <tr class="group hover:bg-blue-50 transition-colors">
        <td class="py-4 px-6 border-b border-slate-100 font-bold text-slate-800 tracking-tight">
            ${formatRupiah(nominal)}
        </td>
        <td class="py-4 px-6 border-b border-slate-100 text-center font-semibold text-slate-600">
            ${formatRupiah(kolom3)}
        </td>
        <td class="py-4 px-6 border-b border-slate-100 text-center font-semibold text-slate-600">
            ${formatRupiah(kolom6)}
        </td>
        <td class="py-4 px-6 border-b border-slate-100 text-center font-bold text-blue-700 bg-blue-50/30">
            ${formatRupiah(kolom12)}
        </td>
    </tr>
`;
    });

    document.getElementById("hasilSection").classList.remove("hidden");
}

function hitungAkumulasi(nominal, tenor, rate) {

    let hasil = (nominal * (rate/100) * 30) / 365;
    let pajak = hasil * 0.20;
    let neto = hasil - pajak;

    return Math.round(neto * tenor);
}

function hitungBaris(nominal) {

    let tbody = document.getElementById("tabelHasil");
    let special = document.getElementById("specialRate").checked;

    for (let tenor in RATE) {

        let rate = special ? SPECIAL_RATE : RATE[tenor];

        let hasil = (nominal * (rate/100) * DAYS_MONTH) / DAYS_YEAR;
        let pajak = hasil * TAX;
        let neto = hasil - pajak;
        let akumulasi = neto * tenor;

        tbody.innerHTML += `
            <tr class="text-center">
                <td class="border p-2">${tenor} Bulan</td>
                <td class="border p-2">${formatRupiah(nominal)}</td>
                <td class="border p-2">${rate}%</td>
                <td class="border p-2">${formatRupiah(hasil.toFixed(2))}</td>
                <td class="border p-2">${formatRupiah(pajak.toFixed(2))}</td>
                <td class="border p-2">${formatRupiah(neto.toFixed(2))}</td>
                <td class="border p-2">${formatRupiah(akumulasi.toFixed(2))}</td>
            </tr>
        `;
    }
}
// Default Rate (Sama seperti hardcode kamu)
let rate3Global = 3.00;
let rate6Global = 3.25;
let rate12Global = 3.50;

function openRateModal() {
    document.getElementById("rateModal").classList.remove("hidden");
    document.getElementById("rateModal").classList.add("flex");
}

function closeRateModal() {
    document.getElementById("rateModal").classList.add("hidden");
    document.getElementById("rateModal").classList.remove("flex");
}

function saveRate() {

    rate3Global = parseFloat(document.getElementById("rate3").value);
    rate6Global = parseFloat(document.getElementById("rate6").value);
    rate12Global = parseFloat(document.getElementById("rate12").value);

    closeRateModal();

    // Kalau sudah pernah generate, auto refresh
    if (!document.getElementById("hasilSection").classList.contains("hidden")) {
        hitungDeposito();
    }
}
// ===== CONTACT PERSON FEATURE =====

function openContactModal() {
    document.getElementById("contactModal").classList.remove("hidden");
    document.getElementById("contactModal").classList.add("flex");
}

function closeContactModal() {
    document.getElementById("contactModal").classList.add("hidden");
    document.getElementById("contactModal").classList.remove("flex");
}

function saveContact() {

    let jabatan = document.getElementById("inputJabatan").value;
    let nama = document.getElementById("inputNama").value;
    let phone = document.getElementById("inputPhone").value;

    document.getElementById("cpJabatan").innerText = jabatan;
    document.getElementById("cpNama").innerText = nama;
    document.getElementById("cpPhone").innerText = phone;

    // Simpan ke localStorage biar tidak hilang saat refresh
    localStorage.setItem("cpJabatan", jabatan);
    localStorage.setItem("cpNama", nama);
    localStorage.setItem("cpPhone", phone);

    closeContactModal();
}

// Load data saat halaman dibuka
window.addEventListener("DOMContentLoaded", function() {

    if (localStorage.getItem("cpNama")) {
        document.getElementById("cpJabatan").innerText = localStorage.getItem("cpJabatan");
        document.getElementById("cpNama").innerText = localStorage.getItem("cpNama");
        document.getElementById("cpPhone").innerText = localStorage.getItem("cpPhone");

        document.getElementById("inputJabatan").value = localStorage.getItem("cpJabatan");
        document.getElementById("inputNama").value = localStorage.getItem("cpNama");
        document.getElementById("inputPhone").value = localStorage.getItem("cpPhone");
    }

});