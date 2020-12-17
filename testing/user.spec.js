const app = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');


chai.use(chaiHttp);
const expect = chai.expect;

const invalidMongooseId = '5fda064eed33f831d8d270x';
const validMongooseId = '5fda064eed33f831d8d270ab';

after(async () => {
  app.mongoose.connection.close();
});

describe(' # Testing user', () => {
  describe(' # Login', ()=> {
    it('Should return invalid form fields', async () => {
      const res = await chai.request(app.app).post('/api/user/login');
      expect(res).to.have.status(400);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql(
          'Form fields do not match requirements!');
    });
  });
  describe(' # Register', ()=> {
    it('Should return invalid form fields', async () => {
      const res = await chai.request(app.app).post('/api/user/register');
      expect(res).to.have.status(400);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql(
          'Form fields do not match requirements!');
    });
  });
  describe(' # Get user info', ()=> {
    it('Should return no bad request for valid user id', async () => {
      const res = await chai.request(app.app)
          .get(`/api/user/${validMongooseId}`);
      expect(res).not.to.have.status(400);
      const resJson = JSON.parse(res.text);
      expect(resJson).to.be.a('object');
    });
    it('Should return 400 for invalid user id', async () => {
      const res = await chai.request(app.app)
          .get(`/api/user/${invalidMongooseId}`);
      expect(res).to.have.status(400);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql(
          `${invalidMongooseId} is not a valid user id!`);
    });
  });
  describe(' # Trying to access protected routes', ()=> {
    it(' # Current user info should return 401', async () => {
      const res = await chai.request(app.app).get('/api/user/');
      expect(res).to.have.status(401);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql('User not logged in!');
    });
    it('Current use save list should return 401', async () => {
      const res = await chai.request(app.app).get('/api/user/saved');
      expect(res).to.have.status(401);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql('User not logged in!');
    });
    it('Edit current user should return 401', async () => {
      const res = await chai.request(app.app).put('/api/user');
      expect(res).to.have.status(401);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql('User not logged in!');
    });
    it('Delete current user should return 401', async () => {
      const res = await chai.request(app.app).delete('/api/user');
      expect(res).to.have.status(401);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql('User not logged in!');
    });
  });
});
