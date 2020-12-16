const app = require('./app');
const chai = require('chai');
const chaiHttp = require('chai-http');


chai.use(chaiHttp);
const expect = chai.expect;

const invalidMongooseId = '123456789';


describe('Testing /api/posts', () => {
  it('Get all posts', async () => {
    const res = await chai.request(app.app).get('/api/posts');
    expect(res).to.have.status(200);
    const resJson = JSON.parse(res.text);
    expect(resJson).to.be.a('array');
  });

  it('Get invalid post id', async () => {
    const res = await chai.request(app.app)
        .get(`/api/posts/${invalidMongooseId}`);
    expect(res).to.have.status(400);
    const resJson = JSON.parse(res.text);
    expect(resJson.error).to.be.eql(true);
    expect(resJson.message).to.be.eql('123456789 is not a valid post id!');
    app.mongoose.connection.close();
  });
});

describe('Testing /api/comments', () => {
  it('Try to get comment with invalid id', async () => {
    const res = await chai.request(app.app)
        .get('/api/comments/'+invalidMongooseId);
    expect(res).to.have.status(400);
    const resJson = JSON.parse(res.text);
    expect(resJson.error).to.be.eql(true);
    expect(resJson.message).to.be.eql('123456789 is an invalid post id!');
  });

  it('Try to get all comments for an invalid post id', async () => {
    const res = await chai.request(app.app)
        .get( `/api/comments/post/${invalidMongooseId}`);
    expect(res).to.have.status(400);
    const resJson = JSON.parse(res.text);
    expect(resJson.error).to.be.eql(true);
    expect(resJson.message).to.be.eql('123456789 is an invalid post id!');
    app.mongoose.connection.close();
  });
});


describe('Testing /api/user', () => {
  it('Try to access user profile, while not logged in', async () => {
    const res = await chai.request(app.app)
        .get('/api/user');
    expect(res).to.have.status(401);
    const resJson = JSON.parse(res.text);
    expect(resJson.message).to.be.eql('User not logged in!');
  });
  it('Try to access save list, while not logged in', async () => {
    const res = await chai.request(app.app)
        .get('/api/user/saved');
    expect(res).to.have.status(401);
    const resJson = JSON.parse(res.text);
    expect(resJson.message).to.be.eql('User not logged in!');
  });
  it('Get user with invalid id', async () => {
    const res = await chai.request(app.app)
        .get(`/api/user/${invalidMongooseId}`);
    expect(res).to.have.status(400);
    const resJson = JSON.parse(res.text);
    expect(resJson.error).to.be.eql(true);
    expect(resJson.message).to.be.eql('123456789 is not a valid user id!');
    app.mongoose.connection.close();
  });
});


