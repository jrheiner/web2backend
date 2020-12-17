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

describe(' # Testing posts', () => {
  describe(' # GET /api/posts/', ()=> {
    it('Should return all posts', async () => {
      const res = await chai.request(app.app).get('/api/posts');
      expect(res).to.have.status(200);
      const resJson = JSON.parse(res.text);
      expect(resJson).to.be.a('array');
    });
    it('Should return 400 with an invalid post id', async () => {
      const res = await chai.request(app.app)
          .get(`/api/posts/${invalidMongooseId}`);
      expect(res).to.have.status(400);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql(
          `${invalidMongooseId} is not a valid post id!`);
    });
    it('Should return not return 400 with a valid post id', async () => {
      const res = await chai.request(app.app)
          .get(`/api/posts/${validMongooseId}`);
      expect(res).not.to.have.status(400);
    });
  });

  describe(' # Trying to access protected routes', ()=> {
    it(' # Create post should return 401', async () => {
      const res = await chai.request(app.app).post('/api/posts');
      expect(res).to.have.status(401);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql('User not logged in!');
    });
    it('Edit post should return 401', async () => {
      const res = await chai.request(app.app)
          .put(`/api/posts/${validMongooseId}`);
      expect(res).to.have.status(401);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql('User not logged in!');
    });
    it('Delete post should return 401', async () => {
      const res = await chai.request(app.app)
          .delete(`/api/posts/${validMongooseId}`);
      expect(res).to.have.status(401);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql('User not logged in!');
    });
  });
});
