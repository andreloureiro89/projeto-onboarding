const {
  requiredString,
  requiredEmail,
  oneOf,
} = require('../utils/validators');

describe('Validators', () => {
  describe('requiredString', () => {
    it('should return trimmed string', () => {
      expect(requiredString('  André  ', 'name')).toBe('André');
    });

    it('should throw when value is empty', () => {
      expect(() =>
        requiredString('', 'name')
      ).toThrow('name is required');
    });

    it('should throw when value is only spaces', () => {
      expect(() =>
        requiredString('   ', 'name')
      ).toThrow('name is required');
    });

    it('should throw when value is not a string', () => {
      expect(() =>
        requiredString(null, 'name')
      ).toThrow('name is required');
    });
  });

  describe('requiredEmail', () => {
    it('should return normalized email', () => {
      expect(
        requiredEmail('TEST@EMAIL.COM')
      ).toBe('test@email.com');
    });

    it('should throw when email is invalid', () => {
      expect(() =>
        requiredEmail('invalid-email')
      ).toThrow('email is invalid');
    });

    it('should throw when email is empty', () => {
      expect(() =>
        requiredEmail('')
      ).toThrow('email is required');
    });
  });

  describe('oneOf', () => {
    it('should return value when option is valid', () => {
      expect(
        oneOf('admin', 'role', ['admin', 'user'])
      ).toBe('admin');
    });

    it('should throw when option is invalid', () => {
      expect(() =>
        oneOf('manager', 'role', ['admin', 'user'])
      ).toThrow('role must be one of: admin, user');
    });
  });
});