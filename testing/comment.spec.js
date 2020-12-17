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

describe(' # Testing comments', () => {
  describe(' # GET /api/comments/', ()=> {
    it('Should return array for valid post id', async () => {
      const res = await chai.request(app.app)
          .get('/api/comments/post/'+validMongooseId);
      expect(res).to.have.status(200);
      const resJson = JSON.parse(res.text);
      expect(resJson).to.be.a('array');
    });
    it('Should return 400 with an invalid post id', async () => {
      const res = await chai.request(app.app)
          .get(`/api/comments/post/${invalidMongooseId}`);
      expect(res).to.have.status(400);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql(
          `${invalidMongooseId} is an invalid post id!`);
    });
  });

  describe(' # Trying to access protected routes', ()=> {
    it(' # Create comment should return 401', async () => {
      const res = await chai.request(app.app)
          .post(`/api/comments/${validMongooseId}`);
      expect(res).to.have.status(401);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql('User not logged in!');
    });
    it('Edit comment should return 401', async () => {
      const res = await chai.request(app.app)
          .put(`/api/comments/${validMongooseId}`);
      expect(res).to.have.status(401);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql('User not logged in!');
    });
    it('Delete comment should return 401', async () => {
      const res = await chai.request(app.app)
          .delete(`/api/comments/${validMongooseId}`);
      expect(res).to.have.status(401);
      const resJson = JSON.parse(res.text);
      expect(resJson.error).to.be.eql(true);
      expect(resJson.message).to.be.eql('User not logged in!');
    });
  });
});
