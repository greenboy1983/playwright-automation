function generateClientJson(wizardData) {
  const { participants, accounts } = wizardData;
  
  // 生成基础的客户信息
  const clientJson = {
    loginInformation: {
      username: `user${Date.now()}`,
      password: "Password123",
      email: `user${Date.now()}@example.com`
    },
    household: {
      name: `${participants[0].firstName} ${participants[0].lastName} Household`,
      address: {
        street: "123 Default St",
        city: "Default City",
        state: "DS",
        zipCode: "12345"
      },
      phone: "123-456-7890"
    },
    participants: participants.map((participant, index) => ({
      id: `P${String(index + 1).padStart(3, '0')}`,
      title: participant.title,
      firstName: participant.firstName,
      lastName: participant.lastName,
      gender: participant.gender,
      dateOfBirth: "1990-01-01",  // 默认值
      ssn: "123-45-6789",  // 默认值
      role: index === 0 ? "PRIMARY" : "SECONDARY"
    })),
    accounts: accounts.map((account, index) => ({
      accountNumber: `ACC${String(index + 1).padStart(3, '0')}`,
      type: account.type,
      balance: account.type === "MARGIN" ? 100000.00 : 10000.00,
      status: "ACTIVE",
      accountHolders: [
        {
          participantId: account.primaryAccountHolder,
          role: "PRIMARY"
        },
        ...(account.secondaryAccountHolder ? [{
          participantId: account.secondaryAccountHolder,
          role: "SECONDARY"
        }] : [])
      ]
    })),
    clientGroups: [
      {
        groupId: "G001",
        name: "Standard Group",
        type: "STANDARD"
      }
    ]
  };

  return clientJson;
}

module.exports = generateClientJson; 