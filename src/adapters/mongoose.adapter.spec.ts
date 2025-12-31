import { MongooseAdapter } from './mongoose.adapter';

describe('MongooseAdapter', () => {
  let mockModel: any;
  let adapter: MongooseAdapter;

  beforeEach(() => {
    mockModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };
    adapter = new MongooseAdapter({ userModel: mockModel });
  });

  describe('createUser', () => {
    it('should create a user and return normalized result', async () => {
      const inputData = { email: 'test@example.com', password: 'pw' };
      const createdDoc = {
        ...inputData,
        _id: '123',
        toObject: function() { return { ...this }; }
      };

      mockModel.create.mockResolvedValue(createdDoc);

      const result = await adapter.createUser(inputData);

      expect(mockModel.create).toHaveBeenCalledWith(inputData);
      expect(result).toEqual({ ...inputData, _id: '123', id: '123', toObject: expect.any(Function) });
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      const foundDoc = {
        email,
        _id: '123',
        toObject: function() { return { ...this }; }
      };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(foundDoc)
      });

      const result = await adapter.findUserByEmail(email);

      expect(mockModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual({ email, _id: '123', id: '123', toObject: expect.any(Function) });
    });

    it('should return null if not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      const result = await adapter.findUserByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should find user by id using default _id', async () => {
      const id = '123';
      const foundDoc = {
        _id: id,
        toObject: function() { return { ...this }; }
      };

      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(foundDoc)
      });

      const result = await adapter.findUserById(id);

      expect(mockModel.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual({ _id: id, id, toObject: expect.any(Function) });
    });
  });
});
