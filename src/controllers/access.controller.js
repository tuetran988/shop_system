class AccessController {
  signUp = async (req, res, next) => {
    try {
        console.log(`[P]::SignUp::`, req.body);
        return res.status(201).json({
            code: '2001',
            metadata:{userid:1}
        })
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AccessController();
