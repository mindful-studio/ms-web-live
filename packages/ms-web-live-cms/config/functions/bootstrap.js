'use strict';
const bcrypt = require('bcryptjs');

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = async () => {
  const user = await strapi.query('strapi::user')
  const project = await strapi.query('application::project.project')

  if(await user.count() === 0) {
    const role = await strapi.query('strapi::role').findOne({ code: 'strapi-super-admin' })
    await user.create({
      firstname: 'MS',
      lastname: 'Admin',
      email: 'admin@mindfulstudio.io',
      password: await bcrypt.hash('passwwdd', 10),
      isActive: true,
      blocked: false,
      roles: [role],
      username: null,
      registrationToken: null,
    })
  }


  if(await project.count() === 0) {
    await project.create({ name: 'MS Web Live' })

    const permission = await strapi.query('plugins::users-permissions.permission')
    const pblk = await strapi.query('plugins::users-permissions.role').findOne({ type: 'public' })

    const p = await permission.findOne({ controller: 'project', action: 'find', role: pblk })
    await permission.update(p, { enabled: true })
  }
};
 
