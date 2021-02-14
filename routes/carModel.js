const mongoose = require('mongoose');

let carSchema = mongoose.Schema({
    price: String,
    name: String,
    contact: String,
    carImageUrl: {
        type: String,
        required: true
    },
    owner_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }
});

module.exports = mongoose.model('car',carSchema);