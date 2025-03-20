const multer = require('multer')

const path = require('path')

const crypto = require('crypto')

const allowedExt = ['.jpg','.jpeg','.png','.gif','.webp'];

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, "uploads/")
    },

    filename: (req, file, cb)=>{

        // jadi untuk menentukan nama filenya sudah ada di sini, jadi tidak perlu membuat nama file lagi di controller
        const hash = crypto.randomBytes(16).toString('hex')

        const ext = path.extname(file.originalname).toLowerCase()

        // nama file plus extension
        cb(null, `${hash}${ext}`)
    }
})

const fileFilter = (req, file, cb) => {
    // mengambil nama extensi filenya, trus jadi lowercase
    const ext = path.extname(file.originalname).toLowerCase();
    // extensi yang sudah di tentukan diawal
    if (allowedExt.includes(ext)) {
        cb(null, true); // jika extensi diizinkan, selanjutnya masuk ke proses upload
    }else{
        // jika extensi tidak diizinkan, maka file tidak akan upload
        cb(new Error('Ekstensi gambar tidak valid'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 5 * 1024 * 1024},
});


// Mengekspor konfigurasi upload agar dapat digunakan di tempat lain
module.exports = upload;