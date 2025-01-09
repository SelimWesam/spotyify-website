const db = require('../config/db');

exports.getAllPlans = (req, res) => {
    const query = 'SELECT * FROM plans';
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching plans', error: err });
      }
      res.status(200).json(results);
    });
  };


  exports.updatePlan = (req, res) => {
    const planId = req.params.planId;
    const { Pname,Pdescription,price } = req.body;
  
    if (!Pname || !Pdescription || !price) {
      return res.status(400).json({ message: 'Name, description and price are required' });
    }
  
    const query = 'UPDATE plans SET Pname = ?, Pdescription = ? ,price= ? ,WHERE id = ?';
    db.query(query, [Pname,Pdescription,price,planId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating plan', error: err });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'plan not found' });
      }
  
      res.status(200).json({ message: 'plan updated successfully' });
    });
  };