drop table if exists rol;
create table rol(
	id int not null auto_increment,
    descripcion varchar(30),
    constraint id primary key (id)
);

drop table if exists usuario;
create table usuario(
	id int not null auto_increment,
    rol int,
    codigo varchar(20) unique not null,
    password varchar(10) not null,
    nombre varchar(50) null,
    apellido varchar(50) null,
    dpi varchar(30) null,
    direccion varchar(100) null,
    telefono varchar(20) null,
    correo varchar(50) null,
    constraint id primary key (id),
    foreign key (rol) references rol(id)
);

drop table if exists membresia;
create table membresia(
	id int not null auto_increment,
    afiliado varchar(20),
    monto float null,
    fecha datetime null,
    tipoPago int null,
    documento varchar(30) null,
    estado int null,	-- 1 activo 2 vencido
    constraint id primary key (id)
);

-- Insert de roles
insert into rol(descripcion) values ('afiliado');
insert into rol(descripcion) values ('empleado');

-- insert afiliado
insert into usuario (rol,codigo,password,nombre,apellido,dpi,direccion,telefono,correo)
values (1,'afi01','123','Cristi Juana','Vasquez','2626069410000','Zona 25 Guatemala','59229000','cristi@gmail.com');

-- insert empleado
insert into usuario (rol,codigo,password,nombre,apellido,dpi,direccion,telefono,correo)
values (2,'emp01','12345','Juan','Perez','285212500555','Zona 6 Guatemala','33215000','juanperez@hotmail.com');

-- insert membresia
insert into membresia (afiliado,monto,fecha,tipoPago,documento,estado)
values ("afi01",100,'2019-04-22 00:00:00',1,'55201645',1);

-- procedimientos almacenados insertar usuario
DROP PROCEDURE IF EXISTS sp_insertarUsuario;
DELIMITER //
CREATE PROCEDURE sp_insertarUsuario(
in pRol int,
in pCodigo varchar(20),
in pPassword varchar(10),
in pNombre varchar(50),
in pApellido varchar(50),
in pDpi varchar(30),
in pDireccion varchar(100),
in pTelefono varchar(20),
in pCorreo varchar(50)
)
BEGIN
declare codigoUsuario varchar(20);
if (pRol = 1) then
	select @codigoUsuario:=CONCAT('afisb', max(id)) as cod from usuario;
else
	select @codigoUsuario:=CONCAT('empsb', max(id)) as cod from usuario;
end if;
insert into usuario (rol,codigo,password,nombre,apellido,dpi,direccion,telefono,correo)
values (pRol,@codigoUsuario,pPassword,pNombre,pApellido,pDpi,pDireccion,pTelefono,pCorreo);
END //
DELIMITER ;
-- hace  drop del sp y llama a la procedimiento
-- CALL sp_insertarUsuario(1,'','123456','administrador','admin','','','','admin@mail.com');


-- procedimientos almacenados obtener usuario
DROP PROCEDURE IF EXISTS sp_obtenerUsuario;
DELIMITER //
CREATE PROCEDURE sp_obtenerUsuario(
in pRol int,
in pCodigo varchar(20),
in pPassword varchar(10)
)
BEGIN
select codigo,nombre,apellido from usuario where codigo = pCodigo and password = pPassword and rol = pRol;
END //
DELIMITER ;
-- llamada de prueba
-- CALL sp_obtenerUsuario(1,'afi02','999666');

-- procedimientos almacenados existe usuario
DROP PROCEDURE IF EXISTS sp_existeUsuario;
DELIMITER //
CREATE PROCEDURE sp_existeUsuario(
in pCodigo varchar(20)
)
BEGIN
select codigo,nombre,apellido from usuario where codigo = pCodigo;
END //
DELIMITER ;
-- llamada de prueba
-- CALL sp_existeUsuario('afi02');

-- procedimientos almacenados obtener estado de membresia
DROP PROCEDURE IF EXISTS sp_obtenerEstadoMembresia;
DELIMITER //
CREATE PROCEDURE sp_obtenerEstadoMembresia(
in pCodigo varchar(20)
)
BEGIN
declare fechaMembresia datetime;
declare estadoMembresia varchar(20);
-- declare idAfiliado int;
-- select id into idAfiliado from usuario where codigo = pCodigo;
select fecha into fechaMembresia from membresia where afiliado = pCodigo and estado = 1;
select if (fechaMembresia is null, '2000-01-01 00:00:00', fechaMembresia) into fechaMembresia;
select if (TIMESTAMPDIFF(DAY, fechaMembresia, now()) < 365 , 'true', 'false') into estadoMembresia;
select estadoMembresia;
END //
DELIMITER ;
-- llamada de prueba
-- CALL sp_obtenerEstadoMembresia('afi01');

-- procedimiento almacenado actualiza password
DROP PROCEDURE IF EXISTS sp_actualizarPassword;
DELIMITER //
CREATE PROCEDURE sp_actualizarPassword(
in pCodigo varchar(20),
in pNuevoPassword varchar(10)
)
BEGIN
update usuario set password = pNuevoPassword where codigo = pCodigo;
END //
DELIMITER ;
-- llamada de prueba
-- CALL sp_actualizarPassword('afi02','bububu');

-- procedimiento almacenado actualiza password
DROP PROCEDURE IF EXISTS sp_actualizarNombre;
DELIMITER //
CREATE PROCEDURE sp_actualizarNombre(
in pCodigo varchar(20),
in pNuevoNombre varchar(50)
)
BEGIN
update usuario set nombre = pNuevoNombre where codigo = pCodigo;
END //
DELIMITER ;
-- llamada de prueba
-- CALL sp_actualizarNombre('afi02','Maria Chacon');

-- procedimiento almacenado obtener roles
DROP PROCEDURE IF EXISTS sp_obtenerRoles;
DELIMITER //
CREATE PROCEDURE sp_obtenerRoles()
BEGIN
select * from rol;
END //
DELIMITER ;
-- llamada de prueba
-- CALL sp_obtenerRoles();

-- procedimiento almacenado insertar membresia
DROP PROCEDURE IF EXISTS sp_insertarMembresia;
DELIMITER //
CREATE PROCEDURE sp_insertarMembresia(
in pAfiliado varchar(20),
in pMonto float,
in pTipoPago int,
in pDocumento varchar(30)
)
BEGIN
declare idRegistro int;
select id into idRegistro from membresia where afiliado = pAfiliado and estado = 1;
if (idRegistro is null) then
	insert into membresia (afiliado,monto,fecha,tipoPago,documento,estado) 
    values (pAfiliado,pMonto,now(),pTipoPago,pDocumento,1);
else
	update membresia set estado = 0 where id = idRegistro;
    insert into membresia (afiliado,monto,fecha,tipoPago,documento,estado) 
    values (pAfiliado,pMonto,now(),pTipoPago,pDocumento,1);
end if;
select id,monto,fecha from membresia where afiliado = pAfiliado and estado = 1;
END //
DELIMITER ;
-- llamada de prueba
-- CALL sp_insertarMembresia('afi01',100,1,'doc00011');

-- procedimiento almacenado obtener membresia
DROP PROCEDURE IF EXISTS sp_obtenerMembresia;
DELIMITER //
CREATE PROCEDURE sp_obtenerMembresia(
in pAfiliado varchar(20)
)
BEGIN
select id,monto,fecha from membresia where afiliado = pAfiliado and estado = 1;
END //
DELIMITER ;
-- llamada de prueba
-- CALL sp_obtenerMembresia('afi01');
