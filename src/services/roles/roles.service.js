const prisma = require("../../config/db");

function notFoundError(message = "Role not found.") {
  const err = new Error(message);
  err.statusCode = 404;
  err.expose = true;
  return err;
}
function conflictError(message) {
  const err = new Error(message);
  err.statusCode = 409;
  err.expose = true;
  return err;
}
function forbiddenError(message) {
  const err = new Error(message);
  err.statusCode = 403;
  err.expose = true;
  return err;
}

async function createRole({ name, label, permissions }) {
  const existing = await prisma.role.findUnique({ where: { name } });
  if (existing) throw conflictError("A role with this name already exists.");

  return prisma.role.create({
    data: { name, label: label.trim(), permissions, isSystem: false },
  });
}

async function listRoles() {
  return prisma.role.findMany({
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    include: { _count: { select: { adminUsers: true } } },
  });
}

async function getRoleById(id) {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { adminUsers: true } } },
  });
  if (!role) throw notFoundError();
  return role;
}

async function updateRole(id, { label, permissions }) {
  const existing = await prisma.role.findUnique({ where: { id } });
  if (!existing) throw notFoundError();

  // The "owner" role must always keep full access - editing it risks locking
  // every admin out of the system if someone removes the wrong permission.
  if (existing.name === "owner") {
    throw forbiddenError("The owner role's permissions cannot be changed.");
  }

  const data = {};
  if (label !== undefined) data.label = label.trim();
  if (permissions !== undefined) data.permissions = permissions;

  return prisma.role.update({ where: { id }, data });
}

async function deleteRole(id) {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { adminUsers: true } } },
  });
  if (!role) throw notFoundError();

  if (role.isSystem) {
    throw forbiddenError("System roles (owner, manager, staff) cannot be deleted.");
  }
  if (role._count.adminUsers > 0) {
    throw conflictError(
      `${role._count.adminUsers} admin(s) still have this role - reassign them before deleting it.`
    );
  }

  await prisma.role.delete({ where: { id } });
  return { deletedId: id };
}

module.exports = { createRole, listRoles, getRoleById, updateRole, deleteRole };
