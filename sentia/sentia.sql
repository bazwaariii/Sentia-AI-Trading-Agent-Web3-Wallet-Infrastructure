-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 04 Bulan Mei 2026 pada 11.49
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sentia`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `agent`
--

CREATE TABLE `agent` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `pubkey` varchar(191) NOT NULL,
  `spent` double NOT NULL DEFAULT 0,
  `limit` double NOT NULL DEFAULT 500,
  `maxPerTx` double NOT NULL DEFAULT 10,
  `dailyLimit` double NOT NULL DEFAULT 100,
  `txCount` int(11) NOT NULL DEFAULT 0,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `lastActive` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `ownerId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `agent`
--

INSERT INTO `agent` (`id`, `name`, `pubkey`, `spent`, `limit`, `maxPerTx`, `dailyLimit`, `txCount`, `status`, `lastActive`, `ownerId`) VALUES
('04bbb077-a4ff-41ab-bfd3-1b3329bfd5d2', 'Trading Bot Alpha', 'Hb3sxwygDK7GbTvcVXfRRdwXFcoivY582Mq4v7QmBBfN', 0, 500, 5, 95, 0, 'active', '2026-05-04 09:04:12.694', '5e57f253-630e-48e4-a944-22677d9f7c21'),
('07daccb2-2791-46ec-81fe-534f303567ea', 'DeFi Agent', 'C1X1DQLLREBS4oHuYDg6YEhEDsMWUedKEpdD9bc5WDQK', 0, 500, 10, 100, 0, 'active', '2026-04-27 09:07:43.490', 'b6297400-b1b3-4c95-bdfa-a42e6449afad'),
('1a65ef24-821a-4e02-9da7-5d743c62908d', 'DeFi Agent', 'Hb3sxwygDK7GbTvcVXfRRdwXFcoivY582Mq4v7QmBBfN', 0, 500, 10, 100, 0, 'active', '2026-05-04 09:04:12.694', '5e57f253-630e-48e4-a944-22677d9f7c21'),
('1a940443-698e-434d-aacb-408704a8606d', 'DeFi Agent', '9Ppc8fCrNK7WpmnSVfgQc8qibBxaD3SM1Jq7pMPoqD54', 0, 500, 10, 100, 0, 'active', '2026-04-27 08:40:50.077', '8f49b26b-69f7-4876-96ac-7f48cc6f7db4'),
('2aa8b10f-21db-45b2-93f9-64b919b7fc6f', 'DeFi Agent', '61HwCCyQXjYtgFmZfMsLgpS9kXuehN1qu3J7QmJBD3tm', 0, 500, 10, 100, 0, 'active', '2026-04-27 09:00:32.167', '68f0a148-3439-4d3b-8ce9-6ffcc917d724'),
('55023819-22a6-4e45-bd25-978d685c1b77', 'Trading Bot Alpha', '9Ppc8fCrNK7WpmnSVfgQc8qibBxaD3SM1Jq7pMPoqD54', 0, 500, 10, 100, 0, 'active', '2026-04-27 08:40:50.077', '8f49b26b-69f7-4876-96ac-7f48cc6f7db4'),
('69d137bf-a908-467f-9a04-c4a689c1b30f', 'Trading Bot Alpha', '6scPpr935HAsjGdibD4SyrFjNQLgg6yxi1g3MhZ48Mt1', 0, 500, 10, 100, 0, 'active', '2026-04-27 08:19:30.472', '7894d455-9bec-4b5e-8fb7-4bff8dcc2623'),
('7a2d18d0-1af9-4486-9d24-3fa1a3f708eb', 'Trading Bot Alpha', '61HwCCyQXjYtgFmZfMsLgpS9kXuehN1qu3J7QmJBD3tm', 0, 500, 10, 100, 0, 'active', '2026-04-27 09:00:32.167', '68f0a148-3439-4d3b-8ce9-6ffcc917d724'),
('a7b04fc7-e0f4-47df-9f6f-5cf07abae0d0', 'DeFi Agent', '9rjiyFcPVETUL2msPpGwgKzqaju6JqzriXsVkyiy1ePK', 0, 500, 6, 90, 0, 'active', '2026-04-26 15:08:53.323', '5d40bbd7-b423-4ec4-9484-7d0008a67e85'),
('c63546e4-05bf-44f2-8dc0-8272c917d3b5', 'Trading Bot Alpha', 'E8EZE5FoVNSEew9Uxr1B5fZz5u3qE5kmMQ7SCV6zafZg', 0, 500, 10, 100, 0, 'active', '2026-04-27 08:54:03.390', 'b5c14ff2-4776-48b3-bfa5-a171fbb21b48'),
('e46b4cb0-3d8b-4971-9ead-8eaaf30894e5', 'Trading Bot Alpha', '9rjiyFcPVETUL2msPpGwgKzqaju6JqzriXsVkyiy1ePK', 0, 500, 10, 100, 0, 'active', '2026-04-26 15:08:53.323', '5d40bbd7-b423-4ec4-9484-7d0008a67e85'),
('f6b50d12-e97a-4c82-846b-7f46d13a69be', 'Trading Bot Alpha', 'C1X1DQLLREBS4oHuYDg6YEhEDsMWUedKEpdD9bc5WDQK', 0, 500, 10, 100, 0, 'active', '2026-04-27 09:07:43.490', 'b6297400-b1b3-4c95-bdfa-a42e6449afad'),
('f81b945b-ac2f-4208-8620-b56717405d39', 'DeFi Agent', 'E8EZE5FoVNSEew9Uxr1B5fZz5u3qE5kmMQ7SCV6zafZg', 0, 500, 10, 100, 0, 'active', '2026-04-27 08:54:03.390', 'b5c14ff2-4776-48b3-bfa5-a171fbb21b48'),
('f8511b39-bbe1-4689-9771-34ff04c1c6c1', 'DeFi Agent', '6scPpr935HAsjGdibD4SyrFjNQLgg6yxi1g3MhZ48Mt1', 0, 500, 10, 100, 0, 'active', '2026-04-27 08:19:30.472', '7894d455-9bec-4b5e-8fb7-4bff8dcc2623');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaction`
--

CREATE TABLE `transaction` (
  `id` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  `token` varchar(191) NOT NULL DEFAULT 'USDC',
  `status` varchar(191) NOT NULL DEFAULT 'pending',
  `toAddress` varchar(191) NOT NULL,
  `hash` varchar(191) NOT NULL DEFAULT 'pending',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `agentId` varchar(191) NOT NULL,
  `ownerId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `transaction`
--

INSERT INTO `transaction` (`id`, `type`, `amount`, `token`, `status`, `toAddress`, `hash`, `createdAt`, `agentId`, `ownerId`) VALUES
('0e1ab803-72d3-4c99-a462-51737a1507eb', 'Agent Trade', 42, 'USDC', 'approved', 'Raydium Pool', 'pending', '2026-04-26 15:45:30.447', 'a7b04fc7-e0f4-47df-9f6f-5cf07abae0d0', '5d40bbd7-b423-4ec4-9484-7d0008a67e85');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `defaultMaxPerTx` int(11) NOT NULL DEFAULT 10,
  `defaultDailyLimit` int(11) NOT NULL DEFAULT 100,
  `monthlyBudgetCap` int(11) NOT NULL DEFAULT 2000,
  `webhookUrl` varchar(191) DEFAULT NULL,
  `telegramChatId` varchar(191) DEFAULT NULL,
  `walletAddress` varchar(191) DEFAULT NULL,
  `walletPrivateKey` varchar(191) DEFAULT NULL,
  `pin` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `createdAt`, `defaultMaxPerTx`, `defaultDailyLimit`, `monthlyBudgetCap`, `webhookUrl`, `telegramChatId`, `walletAddress`, `walletPrivateKey`, `pin`) VALUES
('5d40bbd7-b423-4ec4-9484-7d0008a67e85', 'bazwa arigusna', 'arigusnawawa11@gmail.com', 'bazwa123', '2026-04-26 15:08:53.323', 10, 91, 200, NULL, NULL, '9rjiyFcPVETUL2msPpGwgKzqaju6JqzriXsVkyiy1ePK', '2VGAuPq6LnF9jSb5xkCPYHzhtZwH5kURavXSurpGzS252bErtR12xJYD1tXcqV4dBsGLTCU9g4qA4jERzrHG7AqX', NULL),
('5e57f253-630e-48e4-a944-22677d9f7c21', 'bazwa', 'bazwa456@gmail.com', 'bazwa456', '2026-05-04 09:04:12.694', 4, 85, 1500, NULL, '1039181429', 'Hb3sxwygDK7GbTvcVXfRRdwXFcoivY582Mq4v7QmBBfN', '4ZCHS3qtVGeA92BUu3cKFg4DVt6TihVnQUCN5bnLgtsATSKaocQWHvJGccnjhZkK4yJQgcziWDbgTYSP2i9xQgC8', '121212'),
('68f0a148-3439-4d3b-8ce9-6ffcc917d724', 'sera', 'sera123@gmail.com', 'sera123', '2026-04-27 09:00:32.167', 10, 100, 2000, NULL, NULL, '61HwCCyQXjYtgFmZfMsLgpS9kXuehN1qu3J7QmJBD3tm', '67bjXABHZRSQHZ4dEsZi1NchceMwdb2mNs6cAMxNEQDT38FJvxorjvAfn1GP2mGWUNx2uMfMPstiEamzfEsPEodT', '123456'),
('7894d455-9bec-4b5e-8fb7-4bff8dcc2623', 'joner', 'joner10@gmail.com', 'Joner123', '2026-04-27 08:19:30.472', 10, 100, 2000, NULL, NULL, '6scPpr935HAsjGdibD4SyrFjNQLgg6yxi1g3MhZ48Mt1', '5xReaqRton1cdCZRFiorXYk1CoefAYXJi4oiopEoP8NWiXYPfZ5U4X351kgSjyyHMqVXCX9ixD4t9FfYjMDbYR8y', NULL),
('8f49b26b-69f7-4876-96ac-7f48cc6f7db4', 'sule', 'sule10@gmail.com', 'sule123', '2026-04-27 08:40:50.077', 10, 100, 2000, NULL, NULL, '9Ppc8fCrNK7WpmnSVfgQc8qibBxaD3SM1Jq7pMPoqD54', '33faEi2uXcYAxByRqvFBQ7izSMhdaQpxG8HDpoQedQQ3GQ777s6afCP4Q5UyAi73BRLsvRxbz1s7DW3JWS9nm2MY', '123456'),
('b5c14ff2-4776-48b3-bfa5-a171fbb21b48', 'ariari', 'ari123@gmail.com', 'ari123', '2026-04-27 08:54:03.390', 10, 100, 2000, NULL, NULL, 'E8EZE5FoVNSEew9Uxr1B5fZz5u3qE5kmMQ7SCV6zafZg', 'PCt4Qm2FhyGpkRM4fGPyJ2BbAwTMF5mDtZHSavAsJfwCdhLAaVw9GtaLao1hKxAK8DdpYX9ohEsbRvhcgW1jmNv', '123456'),
('b6297400-b1b3-4c95-bdfa-a42e6449afad', 'ahmad', 'ahmad123@gmail.com', 'ahmad123', '2026-04-27 09:07:43.490', 10, 100, 2000, NULL, '8538688633', 'C1X1DQLLREBS4oHuYDg6YEhEDsMWUedKEpdD9bc5WDQK', '5ngHYr3UFidAw5Zh2ytPgvH1cemu9MQ4GFbjh5xiLedBGoaEJkEzMS7BVZurSdVhMd6Z4SpphZvzeM8y19JSt71Z', '000000');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `agent`
--
ALTER TABLE `agent`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Agent_ownerId_fkey` (`ownerId`);

--
-- Indeks untuk tabel `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Transaction_agentId_fkey` (`agentId`),
  ADD KEY `Transaction_ownerId_fkey` (`ownerId`);

--
-- Indeks untuk tabel `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `agent`
--
ALTER TABLE `agent`
  ADD CONSTRAINT `Agent_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `Transaction_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `agent` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Transaction_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
