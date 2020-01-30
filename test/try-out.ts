import {TryOutInstance, DevInstance} from '../types/truffle-contracts'
import BigNumber from 'bignumber.js'

const bn = (v: string | BigNumber): BigNumber => new BigNumber(v)
const err = (error: Error): Error => error
const oneDev = bn('1000000000000000000')

contract('TryOut', ([alice, bob, zeroUser1, prop1]) => {
	let tryOut: TryOutInstance
	let dev: DevInstance
	before(async () => {
		dev = await artifacts.require('Dev').new({from: alice})
		tryOut = await artifacts.require('TryOut').new(dev.address, {from: alice})
		await dev.mint(alice, bn(oneDev.times(bn('100000000000000'))))
		await dev.mint(bob, bn(oneDev.times(bn('100000000000000'))))
	})
	describe('charge', () => {
		it('charge DEV tokens', async () => {
			const beforeBalance = await dev.balanceOf(tryOut.address).then(bn)
			await dev.approve(tryOut.address, 50, {from: alice})
			await tryOut.charge(50, {from: alice})
			const afterBalance = await dev.balanceOf(tryOut.address).then(bn)

			expect(beforeBalance.toString()).to.be.equal('0')
			expect(afterBalance.toString()).to.be.equal('50')
		})
		it('transferes tokens user-to-TryOut', async () => {
			const beforeBalance = await dev.balanceOf(alice).then(bn)
			await dev.approve(tryOut.address, 50, {from: alice})
			await tryOut.charge(50, {from: alice})
			const afterBalance = await dev.balanceOf(alice).then(bn)

			expect(beforeBalance.minus(afterBalance).toString()).to.be.equal('50')
		})
		it('should fail to charge when without pre-approval', async () => {
			const beforeBalance = await dev.balanceOf(alice).then(bn)
			const res = await tryOut.charge(50, {from: alice}).catch(err)
			const afterBalance = await dev.balanceOf(alice).then(bn)

			expect(beforeBalance.toString()).to.be.equal(afterBalance.toString())
			expect(res).to.be.an.instanceOf(Error)
		})
		it('should fail to charge when sent from a non-owner account', async () => {
			const beforeBalance = await dev.balanceOf(bob).then(bn)
			await dev.approve(tryOut.address, 50, {from: bob})
			const res = await tryOut.charge(50, {from: bob}).catch(err)
			const afterBalance = await dev.balanceOf(bob).then(bn)

			expect(beforeBalance.toString()).to.be.equal(afterBalance.toString())
			expect(res).to.be.an.instanceOf(Error)
		})
	})
	describe('refund', () => {
		beforeEach(async () => {
			await dev.approve(tryOut.address, 50, {from: alice})
			await tryOut.charge(50, {from: alice})
		})
		it('refund DEV tokens', async () => {
			const beforeBalance = await dev.balanceOf(tryOut.address).then(bn)
			await tryOut.refund({from: alice})
			const afterBalance = await dev.balanceOf(tryOut.address).then(bn)

			expect(beforeBalance.toString()).to.be.not.equal('0')
			expect(afterBalance.toString()).to.be.equal('0')
		})
		it('transferes tokens TryOut-to-user', async () => {
			const balance = await dev.balanceOf(tryOut.address).then(bn)
			const beforeBalance = await dev.balanceOf(alice).then(bn)
			await tryOut.refund({from: alice})
			const afterBalance = await dev.balanceOf(alice).then(bn)

			expect(afterBalance.minus(beforeBalance).toString()).to.be.equal(
				balance.toString()
			)
		})
		it('should fail to refund when sent from a non-owner account', async () => {
			const beforeBalanceTryOut = await dev.balanceOf(tryOut.address).then(bn)
			const beforeBalance = await dev.balanceOf(bob).then(bn)
			const res = await tryOut.refund({from: bob}).catch(err)
			const afterBalance = await dev.balanceOf(bob).then(bn)
			const afterBalanceTryOut = await dev.balanceOf(tryOut.address).then(bn)

			expect(beforeBalance.toString()).to.be.equal(afterBalance.toString())
			expect(beforeBalanceTryOut.toString()).to.be.equal(
				afterBalanceTryOut.toString()
			)
			expect(res).to.be.an.instanceOf(Error)
		})
	})
	describe('deposit', () => {
		before(async () => {
			await dev.approve(tryOut.address, oneDev.times(10), {from: alice})
			await tryOut.charge(oneDev.times(10), {from: alice})
		})
		it('deposit DEV tokens', async () => {
			const beforeBalance = await dev.balanceOf(prop1).then(bn)
			await dev.approve(tryOut.address, 50, {from: alice})
			await tryOut.deposit(prop1, 50, {from: alice})
			const afterBalance = await dev.balanceOf(prop1).then(bn)

			expect(afterBalance.minus(beforeBalance).toString()).to.be.equal('50')
		})
		it('airdrop 1 DEV when the first time calling', async () => {
			tryOut = await artifacts.require('TryOut').new(dev.address, {from: alice})
			await dev.approve(tryOut.address, oneDev.times(10), {from: alice})
			await tryOut.charge(oneDev.times(10), {from: alice})

			const beforeBalance = await dev.balanceOf(prop1).then(bn)
			const beforeAliceBalance = await dev.balanceOf(alice).then(bn)
			const beforeTryOutBalance = await dev.balanceOf(tryOut.address).then(bn)

			await dev.approve(tryOut.address, oneDev, {from: alice})
			await tryOut.deposit(prop1, oneDev, {from: alice})

			const afterBalance = await dev.balanceOf(prop1).then(bn)
			const afterAliceBalance = await dev.balanceOf(alice).then(bn)
			const afterTryOutBalance = await dev.balanceOf(tryOut.address).then(bn)

			expect(afterBalance.minus(beforeBalance).toString()).to.be.equal(
				oneDev.toString()
			)
			expect(
				beforeTryOutBalance.minus(afterTryOutBalance).toString()
			).to.be.equal(oneDev.toString())
			expect(beforeAliceBalance.toString()).to.be.equal(
				afterAliceBalance.toString()
			)
		})
		it('subsequent calls have no airdrop', async () => {
			const beforeBalance = await dev.balanceOf(prop1).then(bn)
			const beforeAliceBalance = await dev.balanceOf(alice).then(bn)
			const beforeTryOutBalance = await dev.balanceOf(tryOut.address).then(bn)

			await dev.approve(tryOut.address, oneDev, {from: alice})
			await tryOut.deposit(prop1, oneDev, {from: alice})

			const afterBalance = await dev.balanceOf(prop1).then(bn)
			const afterAliceBalance = await dev.balanceOf(alice).then(bn)
			const afterTryOutBalance = await dev.balanceOf(tryOut.address).then(bn)

			expect(afterBalance.minus(beforeBalance).toString()).to.be.equal(
				oneDev.toString()
			)
			expect(beforeTryOutBalance.toString()).to.be.equal(
				afterTryOutBalance.toString()
			)
			expect(
				beforeAliceBalance.minus(afterAliceBalance).toString()
			).to.be.equal(oneDev.toString())
		})
		it('also can be deposit when sent from 0 DEV holder', async () => {
			const beforeBalance = await dev.balanceOf(prop1).then(bn)
			const beforeUsereBalance = await dev.balanceOf(zeroUser1).then(bn)
			const beforeTryOutBalance = await dev.balanceOf(tryOut.address).then(bn)

			await dev.approve(tryOut.address, oneDev, {from: zeroUser1})
			await tryOut.deposit(prop1, oneDev, {from: zeroUser1})

			const afterBalance = await dev.balanceOf(prop1).then(bn)
			const afterUserBalance = await dev.balanceOf(zeroUser1).then(bn)
			const afterTryOutBalance = await dev.balanceOf(tryOut.address).then(bn)

			expect(afterBalance.minus(beforeBalance).toString()).to.be.equal(
				oneDev.toString()
			)
			expect(
				beforeTryOutBalance.minus(afterTryOutBalance).toString()
			).to.be.equal(oneDev.toString())
			expect(beforeUsereBalance.toString()).to.be.equal(
				afterUserBalance.toString()
			)
			expect(beforeUsereBalance.toString()).to.be.equal('0')
		})
		it('should fail to deposit without pre-approval', async () => {
			const beforeBalance = await dev.balanceOf(prop1).then(bn)
			const beforeAliceBalance = await dev.balanceOf(alice).then(bn)
			const res = await tryOut.deposit(prop1, oneDev, {from: alice}).catch(err)
			const afterBalance = await dev.balanceOf(prop1).then(bn)
			const afterAliceBalance = await dev.balanceOf(alice).then(bn)

			expect(afterBalance.toString()).to.be.equal(beforeBalance.toString())
			expect(afterAliceBalance.toString()).to.be.equal(
				beforeAliceBalance.toString()
			)
			expect(res).to.be.an.instanceOf(Error)
		})
	})
})
