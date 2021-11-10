const database = require('../database/database');
const createHttpError = require('http-errors');

const router = require('express').Router();

router.get('/', function (req, res, next) {
  return database
    .query(`SELECT * FROM modules_tab ORDER BY id;`, [])
    .then((result) => {
      const modules = [];
      for (let i = 0; i < result.rows.length; i++) {
        const module = result.rows[i];
        modules.push({
          id: module.id,
          moduleCode: module.module_code,
          moduleCredit: module.module_credit,
          grade: module.grade,
        });
      }
      return res.json({ modules: modules });
    })
    .catch((error) => {
      return next(error);
    });
});

router.post('/', function (req, res, next) {
  const moduleCode = req.body.moduleCode;
  const moduleCredit = req.body.moduleCredit;
  return database
    .query(`INSERT INTO modules_tab (module_code, module_credit) VALUES ($1, $2)`, [moduleCode, moduleCredit])
    .then(() => {
      return res.sendStatus(201);
    })
    .catch((error) => {
      if (error && error.code === '23505') {
        return next(createHttpError(400, `Module ${moduleCode} already exists`));
      } else if (error) {
        return next(error);
      }
    });
});

router.put('/:moduleCode', function (req, res, next) {
  const grade = req.body.grade;
  const moduleCode = req.params.moduleCode;
  // TODO: Use Parameterized query instead of string concatenation
  return database
    .query(`UPDATE modules_tab SET grade = $1 WHERE module_code = $2`, [grade, moduleCode])
    .then((result) => {
      if (result.rowCount === 0) {
        return next(createHttpError(404, `No such Module: ${moduleCode}`));
      }
      return res.sendStatus(200);
    })
    .catch((error) => {
      return next(error);
    });
});

router.delete('/:moduleCode', function (req, res, next) {
  const moduleCode = req.params.moduleCode;
  console.log(moduleCode);
  // TODO: Use Parameterized query instead of string concatenation
  return database
    .query(`DELETE FROM modules_tab WHERE module_code = $1`, [moduleCode])
    .then(() => {
      return res.sendStatus(200);
    })
    .catch((error) => {
      return next(error);
    });
});

module.exports = router;
