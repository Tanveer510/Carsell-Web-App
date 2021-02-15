const plm = require('passport-local-mongoose');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://car:car@cluster0.60a2n.mongodb.net/cardb',{ useNewUrlParser: true,useUnifiedTopology: true });

let UserSchema = mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String,
  userImageUrl: String,
  cars: [{type: mongoose.Schema.Types.ObjectId, ref: 'car'}],
});

UserSchema.plugin(plm);

module.exports = mongoose.model('user',UserSchema);