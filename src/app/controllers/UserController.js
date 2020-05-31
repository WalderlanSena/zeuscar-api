import User from '../models/User';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({ id, name, email, provider });
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== undefined && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      res.status(401).json({ error: 'Password does not match' });
    }

    const [, { id, name, provider }] = await User.update(req.body, {
      where: { id: req.userId },
      returning: true,
      plain: true,
    });

    return res.json({ id, name, email, provider });
  }

  async index(req, res) {
    const users = await User.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'provider',
        'created_at',
        'updated_at',
      ],
      order: [['id', 'DESC']],
    });

    res.json({ data: users });
  }

  async show(req, res) {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: [
        'id',
        'name',
        'email',
        'provider',
        'created_at',
        'updated_at',
      ],
    });

    if (!user) {
      res.status(400).json({ error: 'Could not found user' });
    }

    return res.json({ data: user });
  }
}

export default new UserController();
