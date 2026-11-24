-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'PRODUTOR');

-- CreateEnum
CREATE TYPE "StatusMaquina" AS ENUM ('DISPONIVEL', 'MANUTENCAO', 'INATIVA');

-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('ATIVA', 'CANCELADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL DEFAULT 'PRODUTOR',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maquinas" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "categoria" VARCHAR(40) NOT NULL,
    "marca" VARCHAR(60) NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor_diaria" DECIMAL(10,2) NOT NULL,
    "descricao" VARCHAR(500),
    "status" "StatusMaquina" NOT NULL DEFAULT 'DISPONIVEL',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maquinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" SERIAL NOT NULL,
    "maquina_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "data_inicio" DATE NOT NULL,
    "data_fim" DATE NOT NULL,
    "propriedade" VARCHAR(120) NOT NULL,
    "finalidade" VARCHAR(300) NOT NULL,
    "valor_total" DECIMAL(12,2) NOT NULL,
    "status" "StatusReserva" NOT NULL DEFAULT 'ATIVA',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "maquinas_codigo_key" ON "maquinas"("codigo");

-- CreateIndex
CREATE INDEX "reservas_maquina_id_data_inicio_data_fim_idx" ON "reservas"("maquina_id", "data_inicio", "data_fim");

-- CreateIndex
CREATE INDEX "reservas_usuario_id_idx" ON "reservas"("usuario_id");

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_maquina_id_fkey" FOREIGN KEY ("maquina_id") REFERENCES "maquinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Segurança extra no próprio banco: período e valor coerentes
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_periodo_check" CHECK ("data_fim" >= "data_inicio");
ALTER TABLE "maquinas" ADD CONSTRAINT "maquinas_diaria_check" CHECK ("valor_diaria" > 0);
