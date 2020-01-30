import {config} from 'dotenv'
config()

const TryOut = artifacts.require('TryOut')

const handler = function(deployer) {
	const {DEV_TOKEN_ADDRESS} = process.env
	if (DEV_TOKEN_ADDRESS === undefined) {
		return
	}

	deployer.deploy(TryOut, DEV_TOKEN_ADDRESS)
} as Truffle.Migration

export = handler
