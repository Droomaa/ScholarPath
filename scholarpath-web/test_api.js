const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:8080/api/beasiswa', {
            instansi_id: 1,
            kategori_id: 1,
            jenjang_id: 1,
            nama: "Test Beasiswa",
            deskripsi: "Test desc",
            kuota_pendaftar: 100,
            tipe_beasiswa: "Penuh",
            nominal_pendanaan: 1000000,
            link_informasi: "http://example.com",
            persyaratan_file: "[]"
        });
        console.log("Success:", res.data);
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}

test();
