function generateClientJson(wizardData) {
  const { participants, accounts, rrCode } = wizardData;
  
  // 首先处理每个参与者的角色
  const participantRoles = participants.map(() => new Set()); // 为每个参与者创建一个角色集合

  // 遍历所有账户，收集参与者角色
  accounts.forEach(account => {
    const primaryIndex = participants.findIndex(p => p.id === account.primaryAccountHolder);
    const secondaryIndex = participants.findIndex(p => p.id === account.secondaryAccountHolder);
    const beneficiaryIndex = participants.findIndex(p => p.id === account.beneficiary);

    if (primaryIndex !== -1) {
      participantRoles[primaryIndex].add("Account Holder");
    }
    if (secondaryIndex !== -1) {
      participantRoles[secondaryIndex].add("Account Holder");
    }
    if (beneficiaryIndex !== -1) {
      participantRoles[beneficiaryIndex].add("Beneficiary");
    }
  });

  // 收集所有唯一的账户持有人组合
  const holderCombinations = new Set();
  accounts.forEach(account => {
    const primaryHolder = participants.findIndex(p => p.id === account.primaryAccountHolder);
    const secondaryHolder = participants.findIndex(p => p.id === account.secondaryAccountHolder);
    
    if (primaryHolder !== -1) {
      const combination = secondaryHolder !== -1 
        ? `${primaryHolder}-${secondaryHolder}`
        : `${primaryHolder}`;
      holderCombinations.add(combination);
    }
  });

  // 生成 clientGroups
  const clientGroups = Array.from(holderCombinations).map((combination, index) => {
    const [primary, secondary] = combination.split('-').map(Number);
    const group = {
      accountHolders: {
        primaryAccountHolder: primary
      }
    };

    if (secondary !== undefined) {
      group.accountHolders.secondaryAccountHolder = secondary;
    }

    return group;
  });

  // 生成基础的客户信息
  const clientJson = {
    loginInformation: {
      username: `user${Date.now()}`,
      password: "Password123",
      email: `user${Date.now()}@example.com`
    },
    household: {
      householdName: `${participants[0].firstName} ${participants[0].lastName} Household`,
      language: "English",
      rrCode: rrCode
    },
    participants: participants.map((participant, index) => ({
      id: `P${String(index + 1).padStart(3, '0')}`,
      index: index,
      title: participant.title,
      firstName: participant.firstName,
      lastName: participant.lastName,
      gender: participant.gender,
      dateOfBirth: "1990-01-01",
      role: Array.from(participantRoles[index])
    })),
    accounts: accounts.map((account, index) => {
      const accountObj = {
        type: account.type
      };

      const primaryHolder = participants.findIndex(p => p.id === account.primaryAccountHolder);
      if (primaryHolder !== -1) {
        accountObj.primaryAccountHolder = primaryHolder;
      }

      const secondaryHolder = participants.findIndex(p => p.id === account.secondaryAccountHolder);
      if (secondaryHolder !== -1) {
        accountObj.secondaryAccountHolder = secondaryHolder;
      }

      const beneficiaryHolder = participants.findIndex(p => p.id === account.beneficiary);
      if (beneficiaryHolder !== -1) {
        accountObj.beneficiary = beneficiaryHolder;
      }

      return accountObj;
    }),
    clientGroups: clientGroups
  };

  return clientJson;
}

module.exports = generateClientJson; 